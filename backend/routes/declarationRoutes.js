const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const db = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        const { stationId, parameterId, selectedClient, fecha } = req.body;
        const file = req.file;

        console.log("📥 Datos recibidos declaración:", {
            estacion: stationId,
            parametro: parameterId,
            cliente: selectedClient,
            fecha: fecha,
            archivo: file?.originalname,
        });

        // Obtener id_medicion correspondiente
        const [medicion] = await db.query(
            `SELECT id_medicion_aire 
             FROM mediciones_aire 
             WHERE id_estacion = ? 
             AND fecha_inicio_muestra = ?
             LIMIT 1`,
            [stationId, fecha],
        );

        if (!medicion.length) {
            throw new Error("No se encontraron mediciones para la fecha especificada");
        }

        // Procesar archivo Excel
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Procesar datos
        const processedData = data.map((row) => [
            medicion[0].id_medicion_aire,
            parseFloat(row.norma_ugm3),
            parseFloat(row.zona_seguridad),
            parseFloat(row.limite_aceptacion),
            parseFloat(row.media_concentracion),
            parseFloat(row.prob_acept_falsa),
            parseFloat(row.prob_acept_falsa_porcentaje),
            parseFloat(row.prob_conformidad),
            row.regla_decision,
        ]);

        // Insertar en base de datos
        const [result] = await db.query(
            `INSERT INTO declaraciones_conformidad 
             (id_medicion, norma_ugm3, zona_seguridad, limite_aceptacion,
              media_concentracion, prob_acept_falsa, prob_acept_falsa_porcentaje,
              prob_conformidad, regla_decision) 
             VALUES ?`,
            [processedData],
        );

        console.log("✅ Declaraciones guardadas:", result.affectedRows);

        res.json({
            success: true,
            message: "Declaraciones guardadas exitosamente",
            data: {
                registrosInsertados: result.affectedRows,
            },
        });
    } catch (error) {
        console.error("❌ Error al procesar declaraciones:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;
