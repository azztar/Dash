const db = require("../config/database");

const getStations = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const userId = req.user.id; // Ahora obtendrá el userId correctamente
        console.log("Consultando estaciones para usuario:", userId);

        const [stations] = await connection.query(
            `SELECT e.*, 
                    GROUP_CONCAT(DISTINCT n.parametro) as parametros_disponibles
             FROM estaciones e
             LEFT JOIN mediciones_aire m ON e.id_estacion = m.id_estacion
             LEFT JOIN normas n ON m.id_norma = n.id_norma
             WHERE e.id_usuario = ?
             GROUP BY e.id_estacion`,
            [userId],
        );

        console.log("Estaciones encontradas:", stations);

        res.json({
            success: true,
            stations: stations.map((station) => ({
                ...station,
                parametros_disponibles: station.parametros_disponibles ? station.parametros_disponibles.split(",") : [],
            })),
        });
    } catch (error) {
        console.error("Error al obtener estaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las estaciones",
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    getStations,
};
