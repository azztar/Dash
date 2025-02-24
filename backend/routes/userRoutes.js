const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const pool = require("../config/database");

// GET - Obtener todos los usuarios
router.get("/", authMiddleware, async (req, res) => {
    try {
        const [users] = await pool.query(
            `SELECT id_usuario, nombre_usuario, email, rol, nombre_empresa, 
             contacto, direccion, nit 
             FROM usuarios`,
        );
        res.json({ success: true, users });
    } catch (error) {
        console.error("❌ Error al obtener usuarios:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST - Crear nuevo usuario
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { nombre_usuario, email, contrasena, rol, nombre_empresa, contacto, direccion, nit } = req.body;
        const hashedPassword = await bcrypt.hash(contrasena, 10);

        const [result] = await pool.query(
            `INSERT INTO usuarios (nombre_usuario, email, contrasena, rol, 
             nombre_empresa, contacto, direccion, nit) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre_usuario, email, hashedPassword, rol, nombre_empresa, contacto, direccion, nit],
        );

        res.json({
            success: true,
            message: "Usuario creado exitosamente",
            userId: result.insertId,
        });
    } catch (error) {
        console.error("❌ Error al crear usuario:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// PUT - Actualizar usuario
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        await pool.query("UPDATE usuarios SET rol = ? WHERE id_usuario = ?", [rol, id]);

        res.json({ success: true, message: "Usuario actualizado exitosamente" });
    } catch (error) {
        console.error("❌ Error al actualizar usuario:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// DELETE - Eliminar usuario
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM usuarios WHERE id_usuario = ?", [id]);
        res.json({ success: true, message: "Usuario eliminado exitosamente" });
    } catch (error) {
        console.error("❌ Error al eliminar usuario:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
