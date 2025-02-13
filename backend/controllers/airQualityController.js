const db = require("../config/database");

const getStations = async (req, res) => {
    try {
        const [stations] = await db.query("SELECT * FROM estaciones");
        res.json({
            success: true,
            data: stations,
        });
    } catch (error) {
        console.error("Error al obtener estaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener estaciones",
        });
    }
};

const getAvailableDates = async (req, res) => {
    const { estacionId, parametro } = req.params;

    try {
        const [dates] = await db.query(
            `SELECT DISTINCT DATE_FORMAT(fecha_inicio_muestra, '%Y-%m-%d') as fecha 
             FROM mediciones_aire 
             WHERE id_estacion = ? 
             AND parametro = ?
             ORDER BY fecha_inicio_muestra`,
            [estacionId, parametro],
        );

        res.json({
            success: true,
            data: dates.map((d) => d.fecha),
        });
    } catch (error) {
        console.error("Error al obtener fechas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener fechas disponibles",
            error: error.message,
        });
    }
};

const getMeasurements = async (req, res) => {
    const { estacionId, parametro, fecha } = req.params;

    try {
        // Convertir la fecha a formato MySQL
        const dateObj = new Date(fecha);
        const mysqlDate = dateObj.toISOString().split("T")[0];

        const [measurements] = await db.query(
            `SELECT 
                m.*,
                d.probabilidad_conformidad,
                d.regla_decision
             FROM mediciones_aire m
             LEFT JOIN declaraciones_conformidad d 
                ON m.id_medicion = d.id_medicion
             WHERE m.id_estacion = ? 
             AND m.parametro = ?
             AND DATE(m.fecha_inicio_muestra) = ?`,
            [estacionId, parametro, mysqlDate],
        );

        res.json({
            success: true,
            data: measurements,
        });
    } catch (error) {
        console.error("Error al obtener mediciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener mediciones",
            error: error.message,
        });
    }
};

module.exports = {
    getStations,
    getAvailableDates,
    getMeasurements,
};
