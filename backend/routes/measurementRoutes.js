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

// Función para obtener o crear norma para el cliente
const getNormaForClient = async (parametroNombre, clienteId) => {
    try {
        // Buscar si el cliente ya tiene la norma
        const [existingNorma] = await db.query(
            `SELECT id_norma 
             FROM normas 
             WHERE parametro = ? AND id_usuario = ?`,
            [parametroNombre, clienteId],
        );

        if (existingNorma.length > 0) {
            return existingNorma[0].id_norma;
        }

        // Valores predeterminados según el parámetro
        const defaultValues = {
            PM10: { limite: 75, unidad: "µg/m³", periodo: "24h" },
            "PM2.5": { limite: 37, unidad: "µg/m³", periodo: "24h" },
            SO2: { limite: 50, unidad: "µg/m³", periodo: "24h" },
            NO2: { limite: 200, unidad: "µg/m³", periodo: "1h" },
            O3: { limite: 100, unidad: "µg/m³", periodo: "8h" },
            CO: { limite: 10000, unidad: "µg/m³", periodo: "8h" },
        };

        const parameterDefaults = defaultValues[parametroNombre] || { limite: 0, unidad: "µg/m³", periodo: "24h" };

        // Crear nueva norma para el cliente con la estructura correcta de la tabla
        const [result] = await db.query(
            `INSERT INTO normas 
             (parametro, valor_limite, unidad, id_usuario, periodo_medicion)
             VALUES (?, ?, ?, ?, ?)`,
            [parametroNombre, parameterDefaults.limite, parameterDefaults.unidad, clienteId, parameterDefaults.periodo],
        );

        console.log(`✅ Norma creada para cliente ${clienteId}: ${parametroNombre}`);
        return result.insertId;
    } catch (error) {
        console.error("❌ Error al obtener/crear norma:", error);
        throw error;
    }
};

// Función para crear o actualizar la norma
const createOrUpdateNorma = async (connection, parametro, clientId) => {
    const [existingNorma] = await connection.query(
        `SELECT id FROM normas 
         WHERE parametro = ? AND id_usuario = ?`,
        [parametro, clientId],
    );

    if (!existingNorma.length) {
        await connection.query(
            `INSERT INTO normas (parametro, valor_limite, unidad, periodo_medicion, id_usuario)
             VALUES (?, ?, ?, ?, ?)`,
            [parametro, 0, "µg/m³", "24h", clientId],
        );
    }
};

// Función para crear o verificar la estación
const createOrVerifyStation = async (connection, stationId, clientId, stationName) => {
    const [existingStation] = await connection.query(
        `SELECT id_estacion FROM estaciones 
         WHERE id_estacion = ? AND id_usuario = ?`,
        [stationId, clientId],
    );

    if (!existingStation.length) {
        await connection.query(
            `INSERT INTO estaciones (id_estacion, nombre_estacion, id_usuario)
             VALUES (?, ?, ?)`,
            [stationId, stationName, clientId],
        );
    }
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

// Función para convertir fecha y hora del formato español
const parseFechaHora = (fechaStr, horaStr) => {
    // Convertir fecha del formato d/mm/yyyy a yyyy-mm-dd
    const [dia, mes, ano] = fechaStr.split("/");
    const fecha = `${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`;

    // Convertir hora y limpiar "a. m." y "p. m."
    let hora = horaStr.toLowerCase().replace(" a. m.", "").replace(" p. m.", "").trim();

    // Asegurar formato de 24 horas
    if (horaStr.toLowerCase().includes("p. m.")) {
        const [h, m] = hora.split(":");
        let hour = parseInt(h);
        if (hour !== 12) hour += 12;
        hora = `${hour}:${m}`;
    }

    return { fecha, hora };
};

// Modificar la ruta de carga
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { stationId, parameterId, selectedClient, fecha_inicio_muestra } = req.body;
        const file = req.file;

        // 1. Crear la estación
        await connection.query(
            `INSERT IGNORE INTO estaciones (id_estacion, nombre_estacion, id_usuario)
             VALUES (?, ?, ?)`,
            [stationId, `Estación ${stationId}`, selectedClient],
        );

        // 2. Crear o actualizar norma
        const [normaResult] = await connection.query(
            `INSERT INTO normas (parametro, valor_limite, unidad, id_usuario, periodo_medicion)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE id_norma = LAST_INSERT_ID(id_norma)`,
            [parameterId, 75, "µg/m³", selectedClient, "24h"],
        );

        const normaId = normaResult.insertId;

        // 3. Procesar archivo CSV/Excel
        const workbook = XLSX.read(file.buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        // 4. Procesar cada fila
        const processedData = data.map((row) => {
            const { fecha, hora } = parseFechaHora(row.fecha_muestra, row.hora_muestra);

            return [
                stationId,
                normaId,
                row.muestra,
                fecha,
                hora,
                parseFloat(row.tiempo_muestreo.replace(",", ".")),
                parseFloat(row.concentracion.replace(",", ".")),
                parseFloat(row.u.replace(",", ".")),
                parseFloat(row.u_factor_cobertura.replace(",", ".")),
                fecha_inicio_muestra,
            ];
        });

        // 5. Insertar mediciones
        if (processedData.length > 0) {
            await connection.query(
                `INSERT INTO mediciones_aire 
                 (id_estacion, id_norma, muestra, fecha_muestra, hora_muestra,
                  tiempo_muestreo, concentracion, u, u_factor_cobertura, fecha_inicio_muestra)
                 VALUES ?`,
                [processedData],
            );
        }

        await connection.commit();
        console.log(`✅ Se procesaron ${processedData.length} mediciones`);

        res.json({
            success: true,
            message: `Datos procesados exitosamente: ${processedData.length} registros`,
        });
    } catch (error) {
        await connection.rollback();
        console.error("❌ Error al procesar archivo:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        connection.release();
    }
});

// En la ruta de carga de mediciones
router.post("/measurements/upload", authMiddleware, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Crear o actualizar norma
        await createOrUpdateNorma(connection, req.body.parameterId, req.body.selectedClient);

        // Crear o verificar estación
        await createOrVerifyStation(connection, req.body.stationId, req.body.selectedClient, `Estación ${req.body.stationId}`);

        // ... resto del código para procesar mediciones ...

        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error("❌ Error al procesar archivo:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        connection.release();
    }
});

module.exports = router;
