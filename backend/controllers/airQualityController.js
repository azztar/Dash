const db = require("../config/database");

const getStations = async (req, res) => {
    try {
        const userId = req.user.userId; // Obtenemos el ID del usuario del token

        const [stations] = await db.query("SELECT * FROM estaciones WHERE id_usuario = ?", [userId]);

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
    const userId = req.user.userId;

    try {
        const [dates] = await db.query(
            `SELECT DISTINCT DATE(ma.fecha_inicio_muestra) as fecha 
             FROM mediciones_aire ma
             INNER JOIN normas n ON ma.id_norma = n.id_norma
             INNER JOIN estaciones e ON ma.id_estacion = e.id_estacion
             WHERE ma.id_estacion = ? 
             AND n.parametro = ?
             AND e.id_usuario = ?
             ORDER BY ma.fecha_inicio_muestra`,
            [estacionId, parametro, userId],
        );

        res.json({
            success: true,
            data: dates.map((d) => d.fecha),
        });
    } catch (error) {
        console.error("Error detallado:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener fechas disponibles",
            error: error.message,
        });
    }
};

const getMeasurements = async (req, res) => {
    const { estacionId, parametro, fecha } = req.params;
    const userId = req.user.userId;

    try {
        const [measurements] = await db.query(
            `SELECT 
                ma.*,
                dc.probabilidad_conformidad,
                dc.regla_decision,
                n.valor_limite,
                n.unidad
             FROM mediciones_aire ma
             INNER JOIN normas n ON ma.id_norma = n.id_norma
             INNER JOIN estaciones e ON ma.id_estacion = e.id_estacion
             LEFT JOIN declaraciones_conformidad dc ON ma.id_medicion_aire = dc.id_medicion
             WHERE ma.id_estacion = ? 
             AND n.parametro = ?
             AND DATE(ma.fecha_inicio_muestra) = ?
             AND e.id_usuario = ?`,
            [estacionId, parametro, fecha, userId],
        );

        res.json({
            success: true,
            data: measurements,
        });
    } catch (error) {
        console.error("Error detallado:", error);
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
