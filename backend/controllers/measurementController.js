const pool = require("../config/database");

const getAvailableDates = async (stationId, parameterId) => {
    try {
        const [rows] = await pool.query(
            `SELECT DISTINCT 
                DATE(fecha_inicio_muestra) as fecha
             FROM mediciones_aire m
             INNER JOIN normas n ON m.id_norma = n.id_norma
             WHERE m.id_estacion = ?
             AND n.parametro = ?
             ORDER BY fecha DESC`,
            [stationId, parameterId],
        );

        console.log("📅 Fechas encontradas en BD:", rows);

        // Convertir las fechas a formato ISO
        const dates = rows.map((row) => {
            const fecha = new Date(row.fecha);
            return fecha.toISOString().split("T")[0];
        });

        console.log("📅 Fechas formateadas:", dates);

        return {
            success: true,
            dates,
            metadata: {
                total: dates.length,
                estacion: stationId,
                parametro: parameterId,
            },
        };
    } catch (error) {
        console.error("❌ Error en getAvailableDates:", error);
        throw error;
    }
};

const getMeasurements = async (req, res) => {
    try {
        const { stationId, parameterId, date } = req.query;

        console.log("📊 Consultando mediciones:", { stationId, parameterId, date });

        // Consulta principal de mediciones con ORDER BY DESC
        const [measurements] = await pool.query(
            `SELECT 
                ma.id_medicion_aire,
                ma.muestra,
                DATE_FORMAT(ma.fecha_muestra, '%d/%m/%Y') as fecha_muestra,
                TIME_FORMAT(ma.hora_muestra, '%l:%i:%s %p') as hora_muestra,
                ma.tiempo_muestreo,
                REPLACE(CAST(ma.concentracion AS DECIMAL(10,2)), '.', ',') as concentracion,
                REPLACE(CAST(ma.u AS DECIMAL(10,4)), '.', ',') as u,
                REPLACE(CAST(ma.u_factor_cobertura AS DECIMAL(10,2)), '.', ',') as u_factor_cobertura,
                n.parametro,
                n.valor_limite,
                n.unidad
             FROM mediciones_aire ma
             JOIN normas n ON ma.id_norma = n.id_norma
             WHERE ma.id_estacion = ? 
             AND n.parametro = ?
             AND DATE(ma.fecha_inicio_muestra) = ?
             ORDER BY CAST(SUBSTRING_INDEX(ma.muestra, '.', -1) AS SIGNED) DESC`,
            [stationId, parameterId, date],
        );

        // Consulta de declaración de conformidad
        const [declaracion] = await pool.query(
            `SELECT * 
             FROM declaraciones_conformidad dc
             JOIN mediciones_aire ma ON dc.id_medicion = ma.id_medicion_aire
             WHERE ma.id_estacion = ? 
             AND DATE(ma.fecha_inicio_muestra) = DATE(?)
             LIMIT 1`,
            [stationId, date],
        );

        // Log para depuración
        console.log(
            "📅 Fechas de mediciones:",
            measurements.map((m) => m.fecha_muestra),
        );

        res.json({
            success: true,
            data: measurements,
            metadata: {
                total: measurements.length,
                declaracionConformidad: declaracion[0] || null,
                norma: {
                    parametro: parameterId,
                    valor_limite: measurements[0]?.valor_limite,
                    unidad: measurements[0]?.unidad,
                },
            },
        });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener mediciones",
        });
    }
};

const processExcelFile = async (buffer, stationId, parameterId) => {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet);

    return data.map((row) => {
        // Procesar fecha y hora
        const [day, month, year] = row.fecha_muestra.split("/");
        const fecha = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

        // Procesar hora (convertir de 12h a 24h)
        let hora = row.hora_muestra.toLowerCase();
        let [hours, minutes] = hora.split(":");
        hours = parseInt(hours);

        if (hora.includes("p. m.") && hours !== 12) {
            hours += 12;
        } else if (hora.includes("a. m.") && hours === 12) {
            hours = 0;
        }

        const horaFormatted = `${hours.toString().padStart(2, "0")}:${minutes.split(" ")[0]}:00`;

        // Extraer número de muestra
        const muestra = row.muestra.toString();

        return {
            id_estacion: stationId,
            id_norma: parameterId,
            muestra: muestra,
            fecha_muestra: fecha,
            hora_muestra: horaFormatted,
            tiempo_muestreo: parseFloat(row.tiempo_muestreo.toString().replace(",", ".")),
            concentracion: row.concentracion,
            u: row.u,
            u_factor_cobertura: row.u_factor_cobertura,
            fecha_inicio_muestra: fecha,
        };
    });
};

const uploadMeasurements = async (req, res) => {
    try {
        const { stationId, parameterId } = req.body;
        const file = req.file;

        if (!file || !stationId || !parameterId) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos",
            });
        }

        const measurements = await processExcelFile(file.buffer, stationId, parameterId);

        // Insertar en la base de datos
        const [result] = await pool.query(
            `INSERT INTO mediciones_aire 
            (id_estacion, id_norma, muestra, fecha_muestra, hora_muestra, 
             tiempo_muestreo, concentracion, u, u_factor_cobertura, fecha_inicio_muestra) 
            VALUES ?`,
            [
                measurements.map((m) => [
                    m.id_estacion,
                    m.id_norma,
                    m.muestra,
                    m.fecha_muestra,
                    m.hora_muestra,
                    m.tiempo_muestreo,
                    m.concentracion,
                    m.u,
                    m.u_factor_cobertura,
                    m.fecha_inicio_muestra,
                ]),
            ],
        );

        console.log("✅ Datos insertados:", {
            registros: result.affectedRows,
            estacion: stationId,
            parametro: parameterId,
        });

        res.json({
            success: true,
            message: "Mediciones guardadas exitosamente",
            data: {
                registrosInsertados: result.affectedRows,
            },
        });
    } catch (error) {
        console.error("❌ Error al procesar archivo:", error);
        res.status(500).json({
            success: false,
            message: "Error al procesar el archivo: " + error.message,
        });
    }
};

module.exports = {
    getMeasurements,
    getAvailableDates,
    uploadMeasurements,
    processExcelFile,
};
