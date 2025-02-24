const express = require("express");
const router = express.Router();
const { getMeasurements, getAvailableDates } = require("../controllers/measurementController");

// Ruta para obtener mediciones
router.get("/measurements", async (req, res) => {
    try {
        const { stationId, parameterId, date } = req.query;
        console.log("📊 Consultando mediciones:", { stationId, parameterId, date });

        // Consulta de mediciones
        const [measurements] = await pool.query(
            `SELECT 
                ma.id_medicion_aire,
                ma.muestra,
                ma.fecha_inicio_muestra,
                ma.hora_muestra,
                ma.concentracion,
                ma.u,
                ma.u_factor_cobertura,
                n.parametro,
                n.unidad
             FROM mediciones_aire ma
             JOIN normas n ON ma.id_norma = n.id_norma
             WHERE ma.id_estacion = ? 
             AND n.parametro = ?
             AND DATE(ma.fecha_inicio_muestra) = ?
             ORDER BY ma.hora_muestra ASC`,
            [stationId, parameterId, date],
        );

        // Consulta de declaración de conformidad
        const [declaracion] = await pool.query(
            `SELECT 
                dc.*
             FROM declaraciones_conformidad dc
             JOIN mediciones_aire ma ON dc.id_medicion = ma.id_medicion_aire
             WHERE ma.id_estacion = ? 
             AND DATE(ma.fecha_inicio_muestra) = ?
             LIMIT 1`,
            [stationId, date],
        );

        res.json({
            success: true,
            data: measurements,
            metadata: {
                total: measurements.length,
                declaracionConformidad: declaracion[0] || null,
            },
        });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener mediciones",
            error: error.message,
        });
    }
});

// Ruta para obtener fechas disponibles
router.get("/measurements/dates", async (req, res) => {
    try {
        const { stationId, parameterId } = req.query;
        const dates = await getAvailableDates(stationId, parameterId);
        res.json({ success: true, dates });
    } catch (error) {
        console.error("Error en ruta /dates:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
