const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Endpoint para iniciar sesión
router.post("/login", async (req, res) => {
    try {
        const { nit, password } = req.body;
        console.log("Datos recibidos:", { nit, password });

        // Buscar usuario por NIT
        const user = await User.findOne({ where: { nit } });
        console.log("Usuario encontrado:", user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // Verificar contraseña
        const isMatch = password === user.contrasena; // Comparación temporal
        console.log("Resultado de comparación:", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Contraseña incorrecta",
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                userId: user.id_usuario,
                nit: user.nit,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );

        // Enviar respuesta exitosa
        return res.json({
            success: true,
            token,
            user: {
                id: user.id_usuario,
                nit: user.nit,
                nombre: user.nombre_usuario,
                email: user.email,
                rol: user.rol,
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({
            success: false,
            message: "Error en el servidor",
        });
    }
});

module.exports = router;
