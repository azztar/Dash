const express = require("express");
const router = express.Router();
const { getStations } = require("../controllers/stationController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getStations);

module.exports = router;
