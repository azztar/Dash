// backend/routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user"); // Modelo de usuario
require("dotenv").config();
const db = require("../config/database");

const router = express.Router();

router.post("/login", async (req, res) => {
    const { nit, password } = req.body;

    try {
        // Buscar el usuario por NIT
        const user = await User.findOne({ where: { nit } });
        if (!user) {
            return res.status(401).json({ message: "Usuario no encontrado." });
        }

        // Verificar la contraseña
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Contraseña incorrecta." });
        }

        // Generar token JWT
        const token = jwt.sign({ id: user.id, nit: user.nit }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // Enviar respuesta con el token
        res.json({ message: "Inicio de sesión exitoso.", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al iniciar sesión." });
    }
});

exports.authMiddleware = (req, res, next) => {
    try {
        // Obtener token de header o query param
        const authHeader = req.headers.authorization;
        const token = (authHeader && authHeader.split(" ")[1]) || req.query.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Acceso no autorizado - Token requerido",
            });
        }

        // Verificar token y extraer datos del usuario
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // IMPORTANTE: Asegurar que estos campos estén disponibles
        req.user = {
            id: decoded.userId || decoded.id, // Asegurar compatibilidad con ambos formatos
            rol: decoded.rol,
            nit: decoded.nit,
        };

        console.log("👤 Usuario autenticado:", {
            id: req.user.id,
            rol: req.user.rol,
        });

        next();
    } catch (error) {
        console.error("Error de autenticación:", error);
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado",
        });
    }
};
