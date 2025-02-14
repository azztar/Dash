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
    try {
        // En lugar de buscar estaciones existentes, siempre devolver las 4 estaciones
        const stations = [
            { id_estacion: "1", nombre_estacion: "Estación 1" },
            { id_estacion: "2", nombre_estacion: "Estación 2" },
            { id_estacion: "3", nombre_estacion: "Estación 3" },
            { id_estacion: "4", nombre_estacion: "Estación 4" },
        ];

        res.json({
            success: true,
            data: stations,
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getClients,
    getClientStations,
};
