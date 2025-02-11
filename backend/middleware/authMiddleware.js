// backend/routes/authRoutes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User"); // Modelo de usuario
require("dotenv").config();

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

module.exports = router;
