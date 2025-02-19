const db = require("../config/database");

const getClients = async (req, res) => {
    try {
        console.log("🔍 Obteniendo lista de clientes");

        const [clients] = await db.query(
            `SELECT 
                id_usuario,
                nombre_empresa,
                nit 
            FROM usuarios 
            WHERE rol = 'cliente'
            ORDER BY nombre_empresa`,
        );

        console.log("✅ Clientes encontrados:", clients.length);

        res.json({
            success: true,
            data: clients,
        });
    } catch (error) {
        console.error("❌ Error al obtener clientes:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener clientes",
        });
    }
};

const getClientStations = async (req, res) => {
    try {
        const { clientId } = req.params;
        console.log("🔍 Buscando estaciones del cliente:", clientId);

        const [stations] = await db.query(
            `SELECT 
                id_estacion,
                nombre_estacion,
                ubicacion
            FROM estaciones 
            WHERE id_usuario = ?`,
            [clientId],
        );

        console.log("✅ Estaciones encontradas:", stations.length);

        res.json({
            success: true,
            data: stations,
        });
    } catch (error) {
        console.error("❌ Error al obtener estaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener estaciones",
        });
    }
};

module.exports = {
    getClients,
    getClientStations,
};
