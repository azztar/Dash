const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/database"); // Asegúrate de importar db

router.post("/login", async (req, res) => {
    try {
        const { nit, password } = req.body;
        console.log("Intento de login:", { nit });

        const [users] = await db.query("SELECT * FROM usuarios WHERE nit = ?", [nit]);

        if (!users || users.length === 0) {
            console.log("Usuario no encontrado");
            return res.status(401).json({
                success: false,
                message: "NIT o contraseña incorrectos",
            });
        }

        const user = users[0];
        console.log("Usuario encontrado:", { id: user.id_usuario, rol: user.rol });

        const validPassword = await bcrypt.compare(password, user.contrasena);
        console.log("Validación de contraseña:", validPassword);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "NIT o contraseña incorrectos",
            });
        }

        const token = jwt.sign(
            {
                userId: user.id_usuario,
                nit: user.nit,
                rol: user.rol,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id_usuario,
                nit: user.nit,
                nombre: user.nombre_usuario,
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

module.exports = router;
