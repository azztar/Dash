const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const { getClients, getClientStations } = require("../controllers/clientController");

router.use(authMiddleware);

router.get("/clients", getClients);
router.get("/clients/:clientId/stations", getClientStations);

module.exports = router;
