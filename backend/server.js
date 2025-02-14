require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const airQualityRoutes = require("./routes/airQualityRoutes");
const clientRoutes = require("./routes/clientRoutes");
const measurementRoutes = require("./routes/measurementRoutes");

const app = express();

app.use(
    cors({
        origin: "http://localhost:3001",
        credentials: true,
    }),
);
app.use(express.json());

// Middleware para logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api", airQualityRoutes);
app.use("/api", clientRoutes);
app.use("/api", measurementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
