require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const airQualityRoutes = require("./routes/airQualityRoutes");
const clientRoutes = require("./routes/clientRoutes");
const measurementRoutes = require("./routes/measurementRoutes");
const stationRoutes = require("./routes/stationRoutes");
const declarationRoutes = require("./routes/declarationRoutes");
const userRoutes = require("./routes/userRoutes");
const filesRoutes = require("./routes/fileRoutes");

// Añadir al inicio del servidor para verificar permisos
const fs = require("fs");
const path = require("path");

// Verificar y crear directorios necesarios
const uploadsDir = path.join(__dirname, "uploads");
const defaultDir = path.join(uploadsDir, "default");

try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log("✅ Directorio uploads creado correctamente");
    }

    if (!fs.existsSync(defaultDir)) {
        fs.mkdirSync(defaultDir, { recursive: true });
        console.log("✅ Directorio uploads/default creado correctamente");
    }

    // Verificar permisos
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log("✅ Permisos de escritura confirmados en directorio uploads");
} catch (error) {
    console.error("❌ Error al verificar directorios o permisos:", error);
}

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
app.use("/api/measurements", measurementRoutes);
app.use("/api/declarations", declarationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", filesRoutes);

// Manejador de errores mejorado con más detalles
app.use((err, req, res, next) => {
    console.error("Error:", err);
    res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        error: err.message,
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "127.0.0.1", () => {
    console.log(`🚀 Servidor corriendo en http://127.0.0.1:${PORT}`);
});
