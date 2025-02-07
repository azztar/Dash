// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const sequelize = require("./config/db.config");
const Test = require("./models/Test"); // Importa el modelo de prueba
const testRoutes = require("./routes/testRoutes");
const authRoutes = require("./routes/authRoutes");

// Importa el archivo de configuración de Passport
require("./config/passport"); // ¡Esto es crucial!

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de sesiones (necesario para Passport)
app.use(
    session({
        secret: "secret", // Cambia esto por un secreto más seguro
        resave: false,
        saveUninitialized: true,
    }),
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

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

// Ruta raíz
app.get("/", (req, res) => {
    res.send("Backend funcionando correctamente");
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

// Rutas
app.use("/api/test", testRoutes);
app.use("/api", authRoutes); // Agrega las rutas de autenticación

// Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
