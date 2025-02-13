const db = require("../config/database");

const getClients = async (req, res) => {
    try {
        // Solo obtener clientes (usuarios con rol 'cliente')
        const [clients] = await db.query("SELECT id_usuario, nombre_empresa, nit FROM usuarios WHERE rol = ?", ["cliente"]);

        res.json({
            success: true,
            data: clients,
        });
    } catch (error) {
        console.error("Error al obtener clientes:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener clientes",
        });
    }
};

const getClientStations = async (req, res) => {
    const { clientId } = req.params;

    try {
        const [stations] = await db.query("SELECT * FROM estaciones WHERE id_usuario = ?", [clientId]);

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

module.exports = {
    getClients,
    getClientStations,
};
