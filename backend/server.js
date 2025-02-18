require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const airQualityRoutes = require("./routes/airQualityRoutes");
const clientRoutes = require("./routes/clientRoutes");
const measurementRoutes = require("./routes/measurementRoutes");
const stationRoutes = require("./routes/stationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Middleware para logging de requests mejorado
app.use((req, res, next) => {
    console.log("🔍 Nueva solicitud:", {
        método: req.method,
        ruta: req.path,
        parámetros: req.query,
        headers: {
            contentType: req.headers["content-type"],
            authorization: req.headers.authorization ? "Present" : "Missing",
        },
        timestamp: new Date().toISOString(),
    });
    next();
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/air-quality", airQualityRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api", measurementRoutes);

// Manejador de errores mejorado con más detalles
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: err.message,
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
