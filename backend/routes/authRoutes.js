// backend/routes/authRoutes.js
const express = require("express");
const { googleAuth } = require("../controllers/authController");

const router = express.Router();

// Ruta para manejar la autenticación con Google
router.post("/google", googleAuth);

module.exports = router;
