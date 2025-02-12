require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./config/database");
const User = require("./models/User");

const app = express();

app.use(
    cors({
        origin: "http://localhost:3001",
        credentials: true,
    }),
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para loggear las peticiones
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, req.body);
    next();
});

// Rutas
app.use("/api/auth", authRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});

// Ruta raíz para verificar que el backend está funcionando
app.get("/", (req, res) => {
    res.send("¡Bienvenido al backend!");
});

// Puerto
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Conectar a la base de datos
        await sequelize.authenticate();
        console.log("Conexión a la base de datos establecida correctamente.");

        // Sincronizar modelos
        await sequelize.sync({ force: false }); // Cambia a `true` solo si deseas recrear las tablas (¡esto eliminará los datos existentes!)
        console.log("Modelos sincronizados con la base de datos.");

        // Iniciar el servidor
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error.stack || error.message);
    }
}

// Iniciar el servidor
startServer();
