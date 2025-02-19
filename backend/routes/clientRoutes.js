const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getClients, getClientStations } = require("../controllers/clientController");

router.get("/", authMiddleware, getClients);
router.get("/:clientId/stations", authMiddleware, getClientStations);

module.exports = router;
