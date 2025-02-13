const express = require("express");
const router = express.Router();
const { uploadMeasurements } = require("../controllers/measurementController");
const upload = require("../middleware/uploadMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/measurements/upload", authMiddleware, upload.single("file"), uploadMeasurements);

module.exports = router;
