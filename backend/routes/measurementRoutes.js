const express = require("express");
const router = express.Router();
const { getMeasurements, getAvailableDates } = require("../controllers/measurementController");

// Ruta para obtener fechas disponibles
router.get("/measurements/dates", async (req, res) => {
    try {
        const { stationId, parameterId } = req.query;

        if (!stationId || !parameterId) {
            return res.status(400).json({
                success: false,
                message: "Se requieren estación y parámetro",
            });
        }

        const result = await getAvailableDates(stationId, parameterId);
        res.json(result);
    } catch (error) {
        console.error("❌ Error al obtener fechas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener fechas disponibles",
            error: error.message,
        });
    }
});

// Ruta para obtener mediciones
router.get("/measurements", getMeasurements);

module.exports = router;
