const express = require("express");
const router = express.Router();
const db = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Obtener estaciones
router.get("/estaciones", async (req, res) => {
    try {
        const [estaciones] = await db.query("SELECT * FROM estaciones WHERE id_usuario = ?", [req.user.userId]);
        res.json(estaciones);
    } catch (error) {
        console.error("Error al obtener estaciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener estaciones",
        });
    }
});

// Obtener fechas disponibles por estación y parámetro
router.get("/fechas-disponibles/:id_estacion/:parametro", async (req, res) => {
    try {
        const [fechas] = await db.query(
            `SELECT DISTINCT DATE_FORMAT(fecha_inicio_muestra, '%Y-%m') as fecha
             FROM mediciones_aire 
             WHERE id_estacion = ? AND parametro = ?`,
            [req.params.id_estacion, req.params.parametro],
        );
        res.json(fechas.map((f) => f.fecha));
    } catch (error) {
        console.error("Error al obtener fechas disponibles:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener fechas disponibles",
        });
    }
});

// Obtener mediciones por estación
router.get("/mediciones/:id_estacion", async (req, res) => {
    try {
        const [mediciones] = await db.query(
            `SELECT 
                m.*,
                DATE_FORMAT(m.fecha_hora_inicial, '%d/%m/%Y') as fecha_formateada,
                n.valor_limite
             FROM mediciones_aire m
             JOIN normas n ON m.id_norma = n.id_norma
             WHERE m.id_estacion = ?
             ORDER BY m.fecha_hora_inicial DESC`,
            [req.params.id_estacion],
        );

        res.json(mediciones);
    } catch (error) {
        console.error("Error al obtener mediciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener mediciones",
        });
    }
});

// Obtener detalle de una medición específica
router.get("/medicion/:id_medicion", async (req, res) => {
    try {
        const [medicion] = await db.query(
            `SELECT m.*, n.valor_limite 
             FROM mediciones_aire m 
             JOIN normas n ON m.id_norma = n.id_norma 
             WHERE m.id_medicion = ?`,
            [req.params.id_medicion],
        );

        res.json(medicion[0]);
    } catch (error) {
        console.error("Error al obtener detalle de medición:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener detalle de medición",
        });
    }
});

// Obtener mediciones por estación, parámetro y fecha
router.get("/mediciones-aire", async (req, res) => {
    try {
        const { id_estacion, parametro, fecha } = req.query;
        const [mediciones] = await db.query(
            `SELECT m.*, n.valor_limite 
             FROM mediciones_aire m 
             JOIN normas n ON m.id_norma = n.id_norma 
             WHERE m.id_estacion = ? AND m.parametro = ? AND DATE_FORMAT(m.fecha_inicio_muestra, '%Y-%m') = ?`,
            [id_estacion, parametro, fecha],
        );
        res.json(mediciones);
    } catch (error) {
        console.error("Error al obtener mediciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener mediciones",
        });
    }
});

module.exports = router;
