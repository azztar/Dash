require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const sequelize = require("./config/database");
const User = require("./models/User");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);

// Ruta raíz para verificar que el backend está funcionando
app.get("/", (req, res) => {
    res.send("¡Bienvenido al backend!");
});

// Iniciar servidor
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
