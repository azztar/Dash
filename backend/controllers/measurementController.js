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

        const [measurements] = await pool.query(
            `SELECT 
                m.id_medicion_aire,
                m.fecha_inicio_muestra,
                m.concentracion as valor_medicion,
                n.parametro,
                n.valor_limite,
                n.unidad,
                CASE 
                    WHEN m.concentracion > n.valor_limite THEN 'Excede'
                    ELSE 'Cumple'
                END as estado
            FROM mediciones_aire m
            INNER JOIN normas n ON m.id_norma = n.id_norma
            WHERE m.id_estacion = ?
            AND n.parametro = ?
            AND DATE(m.fecha_inicio_muestra) = DATE(?)
            ORDER BY m.fecha_inicio_muestra ASC`,
            [stationId, parameterId, date],
        );

        return res.json({
            success: true,
            data: measurements,
            metadata: {
                total: measurements.length,
                estacion: stationId,
                parametro: parameterId,
                fecha: date,
                resumen: {
                    promedio: measurements.reduce((acc, m) => acc + parseFloat(m.valor_medicion), 0) / measurements.length,
                    excedencias: measurements.filter((m) => m.estado === "Excede").length,
                },
            },
        });
    } catch (error) {
        console.error("❌ Error en getMeasurements:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener mediciones",
            error: error.message,
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
