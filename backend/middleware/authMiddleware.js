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

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No se proporcionó token",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Incluir información adicional en req.user
        req.user = {
            userId: decoded.userId,
            nit: decoded.nit,
            rol: decoded.rol,
            empresa: decoded.empresa,
        };

        next();
    } catch (error) {
        console.error("Error en autenticación:", error);
        return res.status(401).json({
            success: false,
            message: "Token inválido",
        });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.currentUser || !req.user.currentUser.rol) {
            return res.status(401).json({
                success: false,
                message: "No autorizado",
            });
        }

        if (!roles.includes(req.user.currentUser.rol)) {
            return res.status(403).json({
                success: false,
                message: "No tiene permisos suficientes",
            });
        }
        next();
    };
};

module.exports = { authMiddleware, checkRole };
