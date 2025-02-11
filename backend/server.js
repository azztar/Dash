require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db.config");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Conexión a la base de datos establecida correctamente.");

        await sequelize.sync();
        console.log("Modelos sincronizados con la base de datos.");

        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Error al iniciar el servidor:", error);
    }
}

startServer();
