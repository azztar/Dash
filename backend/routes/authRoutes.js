const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Ruta de login
router.post("/login", authController.login);

// Ruta para validar token
router.get("/validate-token", authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user,
    });
});

router.get("/verify", authMiddleware, authController.verifyToken);

router.get("/user-info", authMiddleware, async (req, res) => {
    try {
        // El middleware authMiddleware ya verificó el token
        const userId = req.user.userId || req.user.id;

        // Consultar la base de datos para obtener todos los datos del usuario, incluyendo el rol
        const [users] = await db.query("SELECT id_usuario, nombre_usuario, email, rol, nombre_empresa FROM usuarios WHERE id_usuario = ?", [userId]);

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // Devolver la información completa del usuario
        res.json({
            success: true,
            user: users[0],
        });
    } catch (error) {
        console.error("Error al obtener información del usuario:", error);
        res.status(500).json({
            success: false,
            message: "Error del servidor",
        });
    }
});

module.exports = router;
