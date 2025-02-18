const express = require("express");
const router = express.Router();
const { getMeasurements, getAvailableDates } = require("../controllers/measurementController");

// Ruta para obtener mediciones
router.get("/measurements", getMeasurements);

// Ruta para obtener fechas disponibles
router.get("/measurements/dates", async (req, res) => {
    try {
        const { stationId, parameterId } = req.query;
        const dates = await getAvailableDates(stationId, parameterId);
        res.json({ success: true, dates });
    } catch (error) {
        console.error("Error en ruta /dates:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
