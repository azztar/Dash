const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getClients, getClientStations } = require("../controllers/clientController");

router.get("/", authMiddleware, getClients);
router.get("/:clientId/stations", authMiddleware, getClientStations);

router.get("/clients/:clientId/stations", authMiddleware, async (req, res) => {
    const { clientId } = req.params;
    try {
        // Estaciones predeterminadas
        const defaultStations = [
            { id_estacion: "1", nombre_estacion: "Estación 1" },
            { id_estacion: "2", nombre_estacion: "Estación 2" },
            { id_estacion: "3", nombre_estacion: "Estación 3" },
            { id_estacion: "4", nombre_estacion: "Estación 4" },
        ];

        // Devolver las estaciones predeterminadas
        res.json({
            success: true,
            data: defaultStations,
        });
    } catch (error) {
        console.error("Error getting stations:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener estaciones",
        });
    }
});

module.exports = router;
