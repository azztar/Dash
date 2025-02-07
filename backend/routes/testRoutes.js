// backend/routes/testRoutes.js
const express = require("express");
const { createTest } = require("../controllers/testController");
const Test = require("../models/Test"); // Importa el modelo Test

const router = express.Router();

// Ruta GET para obtener datos
router.get("/", async (req, res) => {
    try {
        const tests = await Test.findAll(); // Consulta todos los registros
        res.json({ success: true, data: tests });
    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        res.status(500).json({ success: false, message: "Error al consultar la base de datos." });
    }
});

// Ruta POST para insertar datos
router.post("/", createTest);

module.exports = router;
