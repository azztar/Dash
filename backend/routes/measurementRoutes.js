const express = require("express");
const router = express.Router();
const { uploadMeasurements } = require("../controllers/measurementController");
const upload = require("../middleware/uploadMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

// La ruta completa será /api/measurements/upload
router.post("/measurements/upload", authMiddleware, upload.single("file"), uploadMeasurements);

module.exports = router;
