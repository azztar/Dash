const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/login", async (req, res) => {
    try {
        const { nit, password } = req.body;

        console.log("Intento de login:", { nit, password });

        const user = await User.findOne({ where: { nit } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.contrasena);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Contraseña incorrecta",
            });
        }

        const token = jwt.sign({ userId: user.id_usuario, nit: user.nit }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({
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
        res.status(500).json({
            success: false,
            message: "Error en el servidor",
        });
    }
});

// Ruta para validar el token
router.get("/validate-token", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No se proporcionó token",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({
            where: { id_usuario: decoded.userId },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id_usuario,
                nit: user.nit,
                nombre: user.nombre_usuario,
                email: user.email,
                rol: user.rol,
            },
        });
    } catch (error) {
        console.error("Error al validar token:", error);
        res.status(401).json({
            success: false,
            message: "Token inválido o expirado",
        });
    }
});

module.exports = router;
