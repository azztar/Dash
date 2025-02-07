// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db.config");
const Test = require("./models/Test"); // Importa el modelo de prueba

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MySQL
sequelize
    .authenticate()
    .then(() => {
        console.log("Conectado a MySQL");
        return sequelize.sync({ alter: true }); // Sincroniza los modelos
    })
    .then(() => {
        console.log("Modelos sincronizados con la base de datos");
    })
    .catch((err) => {
        console.error("Error al conectar a MySQL:", err);
    });

// Ruta de prueba
app.get("/api/test", async (req, res) => {
    try {
        const tests = await Test.findAll(); // Consulta todos los registros
        res.json({ success: true, data: tests });
    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        res.status(500).json({ success: false, message: "Error al consultar la base de datos." });
    }
});

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
