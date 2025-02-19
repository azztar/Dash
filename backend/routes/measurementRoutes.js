const express = require("express");
const router = express.Router();
const { getMeasurements, getAvailableDates } = require("../controllers/measurementController");
const { authMiddleware } = require("../middleware/authMiddleware");
const multer = require("multer");
const XLSX = require("xlsx");
const db = require("../config/database"); // Añadir esta línea

// Configurar multer para archivos Excel
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Agregar función para obtener id_norma
const getNormaId = async (parametroNombre) => {
    const [normas] = await db.query("SELECT id_norma FROM normas WHERE nombre_norma = ?", [parametroNombre]);
    if (normas.length === 0) {
        throw new Error(`Norma no encontrada para el parámetro: ${parametroNombre}`);
    }
    return normas[0].id_norma;
};

// Ruta para obtener fechas disponibles
router.get("/dates", async (req, res) => {
    // Cambiar /measurements/dates a /dates
    try {
        const { stationId, parameterId } = req.query;

        if (!stationId || !parameterId) {
            return res.status(400).json({
                success: false,
                message: "Se requieren estación y parámetro",
            });
        }

        const result = await getAvailableDates(stationId, parameterId);
        res.json(result);
    } catch (error) {
        console.error("❌ Error al obtener fechas:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener fechas disponibles",
            error: error.message,
        });
    }
});

// Ruta para obtener mediciones
router.get("/", getMeasurements); // Cambiar /measurements a /

// Ruta para cargar mediciones
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        const { stationId, parameterId } = req.body;
        const file = req.file;

        // Obtener el ID real de la norma
        const normaId = await getNormaId(parameterId);

        console.log("📥 Datos recibidos:", {
            estacion: stationId,
            parametro: parameterId,
            archivo: file?.originalname,
        });

        // Validar datos requeridos
        if (!file || !stationId || !parameterId) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos",
            });
        }

        // Leer archivo Excel
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet);

        // Procesar datos
        const processedData = data.map((row) => {
            try {
                console.log("📄 Procesando fila:", row);

                // Procesar fecha
                let fecha;
                if (typeof row.fecha_muestra === "string") {
                    const [day, month, year] = row.fecha_muestra.split("/");
                    fecha = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
                } else {
                    fecha = new Date(row.fecha_muestra).toISOString().split("T")[0];
                }

                // Procesar hora
                let horaFormatted;
                if (typeof row.hora_muestra === "string") {
                    let hora = row.hora_muestra.toLowerCase();
                    let [hours, minutes] = hora.split(":");
                    hours = parseInt(hours);

                    if (hora.includes("p. m.") && hours !== 12) {
                        hours += 12;
                    } else if (hora.includes("a. m.") && hours === 12) {
                        hours = 0;
                    }

                    horaFormatted = `${hours.toString().padStart(2, "0")}:${minutes.split(" ")[0]}:00`;
                } else {
                    // Si es un número de Excel (serial date)
                    const horaExcel = XLSX.SSF.parse_date_code(row.hora_muestra);
                    horaFormatted = `${horaExcel.H.toString().padStart(2, "0")}:${horaExcel.M.toString().padStart(2, "0")}:00`;
                }

                // Procesar tiempo_muestreo
                const tiempo_muestreo =
                    typeof row.tiempo_muestreo === "string" ? parseFloat(row.tiempo_muestreo.replace(",", ".")) : parseFloat(row.tiempo_muestreo);

                // Procesar valores numéricos
                const concentracion = parseFloat(row.concentracion) || 0;
                const u = parseFloat(row.u) || 0;
                const u_factor_cobertura = parseFloat(row.u_factor_cobertura) || 0;

                return [
                    stationId,
                    normaId, // Usar el ID real de la norma
                    row.muestra?.toString() || "",
                    fecha,
                    horaFormatted,
                    tiempo_muestreo,
                    concentracion,
                    u,
                    u_factor_cobertura,
                    fecha,
                ];
            } catch (error) {
                console.error("❌ Error procesando fila:", {
                    error: error.message,
                    datos: row,
                });
                throw new Error(`Error en fila ${JSON.stringify(row)}: ${error.message}`);
            }
        });

        // Insertar en la base de datos
        const [result] = await db.query(
            `INSERT INTO mediciones_aire 
            (id_estacion, id_norma, muestra, fecha_muestra, hora_muestra, 
             tiempo_muestreo, concentracion, u, u_factor_cobertura, fecha_inicio_muestra) 
            VALUES ?`,
            [processedData],
        );

        console.log("✅ Datos insertados:", {
            registros: result.affectedRows,
            estacion: stationId,
            parametro: parameterId,
        });

        res.json({
            success: true,
            message: "Mediciones guardadas exitosamente",
            data: {
                registrosInsertados: result.affectedRows,
            },
        });
    } catch (error) {
        console.error("❌ Error al procesar archivo:", error);
        res.status(500).json({
            success: false,
            message: "Error al procesar el archivo: " + error.message,
            details: error.stack,
        });
    }
});

module.exports = router;
