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

module.exports = {
    getMeasurements,
    getAvailableDates,
};
