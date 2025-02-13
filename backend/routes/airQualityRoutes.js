const express = require("express");
const router = express.Router();
const { getStations, getAvailableDates, getMeasurements } = require("../controllers/airQualityController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/estaciones", getStations);
router.get("/fechas-disponibles/:estacionId/:parametro", getAvailableDates);
router.get("/mediciones/:estacionId/:parametro/:fecha", getMeasurements);

module.exports = router;
