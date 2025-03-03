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

// Función para crear o actualizar norma
const createOrUpdateNorma = async (connection, parametro, clientId) => {
    try {
        console.log("🔍 Verificando norma:", { parametro, clientId });

        // Valores por defecto según el parámetro
        const defaultValues = {
            PM10: { limite: 75, unidad: "µg/m³", periodo: "24h" },
            "PM2.5": { limite: 37, unidad: "µg/m³", periodo: "24h" },
            SO2: { limite: 50, unidad: "µg/m³", periodo: "24h" },
            NO2: { limite: 200, unidad: "µg/m³", periodo: "1h" },
            O3: { limite: 100, unidad: "µg/m³", periodo: "8h" },
            CO: { limite: 10000, unidad: "µg/m³", periodo: "8h" },
        };

        const parameterDefaults = defaultValues[parametro] || {
            limite: 75,
            unidad: "µg/m³",
            periodo: "24h",
        };

        // Verificar si existe la norma
        const [existingNorma] = await connection.query(
            `SELECT id_norma FROM normas 
             WHERE parametro = ? AND id_usuario = ?`,
            [parametro, clientId],
        );

        if (existingNorma.length === 0) {
            console.log("📝 Creando nueva norma");
            const [result] = await connection.query(
                `INSERT INTO normas (parametro, valor_limite, unidad, id_usuario, periodo_medicion)
                 VALUES (?, ?, ?, ?, ?)`,
                [parametro, parameterDefaults.limite, parameterDefaults.unidad, clientId, parameterDefaults.periodo],
            );
            console.log("✅ Norma creada exitosamente");
            return result.insertId;
        }

        console.log("✅ Norma existente encontrada");
        return existingNorma[0].id_norma;
    } catch (error) {
        console.error("❌ Error en createOrUpdateNorma:", error);
        throw error;
    }
};

// Función para crear o verificar la estación
const createOrVerifyStation = async (connection, stationId, clientId, stationName) => {
    try {
        console.log("🔍 Verificando estación:", { stationId, clientId, stationName });

        // Verificar si la estación existe
        const [existingStation] = await connection.query("SELECT * FROM estaciones WHERE id_estacion = ?", [stationId]);

        if (existingStation.length === 0) {
            console.log("📝 Creando nueva estación");
            await connection.query(
                `INSERT INTO estaciones (id_estacion, nombre_estacion, id_usuario, numero_estacion) 
                 VALUES (?, ?, ?, ?)`,
                [stationId, `Estación ${stationId}`, clientId, stationId],
            );
            console.log(`✅ Estación ${stationId} creada exitosamente`);
            return true;
        }

        console.log(`ℹ️ Estación ${stationId} ya existe`);
        return true;
    } catch (error) {
        console.error("❌ Error en createOrVerifyStation:", error);
        throw error;
    }
};

// Ruta para obtener fechas disponibles
router.get("/available-dates", authMiddleware, async (req, res) => {
    const { stationId, parametro } = req.query;
    const userId = req.user.id;

    try {
        // Primero verificar si existe la norma
        const [norma] = await db.query(
            `SELECT id_norma 
             FROM normas 
             WHERE parametro = ? 
             AND id_usuario = ?`,
            [parametro, userId],
        );

        if (norma.length === 0) {
            return res.json({
                success: true,
                dates: [],
                metadata: {
                    total: 0,
                    parametro,
                    estacion: stationId,
                    mensaje: "No existe norma para este parámetro",
                },
            });
        }

        // Si existe la norma, buscar las fechas
        const [dates] = await db.query(
            `SELECT DISTINCT ma.fecha_inicio_muestra 
             FROM mediciones_aire ma
             JOIN normas n ON ma.id_norma = n.id_norma
             WHERE ma.id_estacion = ?
             AND n.parametro = ?
             AND n.id_usuario = ?
             ORDER BY ma.fecha_inicio_muestra DESC`,
            [stationId, parametro, userId],
        );

        console.log(`✨ Fechas encontradas:`, dates);

        res.json({
            success: true,
            dates: dates.map((d) => d.fecha_inicio_muestra),
            metadata: {
                total: dates.length,
                parametro,
                estacion: stationId,
                usuario: userId,
            },
        });
    } catch (error) {
        console.error("❌ Error al obtener fechas:", error);
        res.status(500).json({
            success: false,
            message: error.message,
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
        console.log("📝 Datos recibidos:", { stationId, parameterId, selectedClient });

        // 1. Crear o verificar la estación
        await createOrVerifyStation(connection, stationId, selectedClient, `Estación ${stationId}`);

        // 2. Obtener o crear la norma
        const normaId = await createOrUpdateNorma(connection, parameterId, selectedClient);

        // 3. Procesar el archivo Excel
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        // 4. Preparar los datos para inserción
        const processedData = data.map((row) => [
            stationId,
            normaId,
            row.muestra,
            parseFechaHora(row.fecha_muestra, row.hora_muestra).fecha,
            parseFechaHora(row.fecha_muestra, row.hora_muestra).hora,
            parseFloat(row.tiempo_muestreo.replace(",", ".")),
            parseFloat(row.concentracion.replace(",", ".")),
            parseFloat(row.u.replace(",", ".")),
            parseFloat(row.u_factor_cobertura.replace(",", ".")),
            fecha_inicio_muestra,
        ]);

        // 5. Insertar mediciones
        if (processedData.length > 0) {
            await connection.query(
                `INSERT INTO mediciones_aire 
                 (id_estacion, id_norma, muestra, fecha_muestra, hora_muestra,
                  tiempo_muestreo, concentracion, u, u_factor_cobertura, fecha_inicio_muestra)
                 VALUES ?`,
                [processedData],
            );
            console.log(`✅ Se insertaron ${processedData.length} mediciones`);
        }

        await connection.commit();
        res.json({
            success: true,
            message: `Se procesaron ${processedData.length} mediciones correctamente`,
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

router.get("/parameters/:stationId", authMiddleware, async (req, res) => {
    const { stationId } = req.params;
    const userId = req.user.id;

    try {
        const [parameters] = await db.query(
            `SELECT DISTINCT n.parametro 
             FROM normas n
             JOIN mediciones_aire ma ON ma.id_norma = n.id_norma
             WHERE ma.id_estacion = ?
             AND n.id_usuario = ?`,
            [stationId, userId],
        );

        res.json({
            success: true,
            parameters: parameters.map((p) => p.parametro),
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

router.get("/measurements", authMiddleware, async (req, res) => {
    const { stationId, parameterId, date } = req.query;
    const userId = req.user.id;

    console.log("📊 Consultando mediciones:", { stationId, parameterId, date });

    try {
        // 1. Obtener mediciones
        const [mediciones] = await db.query(
            `SELECT ma.*, n.parametro, n.valor_limite, n.unidad
             FROM mediciones_aire ma
             JOIN normas n ON ma.id_norma = n.id_norma
             WHERE ma.id_estacion = ?
             AND n.parametro = ?
             AND DATE(ma.fecha_inicio_muestra) = DATE(?)
             AND n.id_usuario = ?`,
            [stationId, parameterId, date, userId],
        );

        // 2. Obtener declaración de conformidad
        const [declaracion] = await db.query(
            `SELECT dc.*
             FROM declaraciones_conformidad dc
             JOIN mediciones_aire ma ON dc.id_medicion = ma.id_medicion_aire
             WHERE ma.id_estacion = ? 
             AND DATE(ma.fecha_inicio_muestra) = DATE(?)`,
            [stationId, date],
        );

        // 3. Enviar respuesta combinada
        res.json({
            success: true,
            data: mediciones,
            metadata: {
                total: mediciones.length,
                declaracionConformidad: declaracion[0] || null,
                fecha: date,
                estacion: stationId,
                parametro: parameterId,
            },
        });
    } catch (error) {
        console.error("❌ Error al obtener mediciones:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener las mediciones",
            error: error.message,
        });
    }
});

// Ruta para obtener mediciones recientes para el dashboard
router.get("/recent/:userId", authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // Verificar permisos - solo puede ver sus propias mediciones o un admin puede ver todo
        if (req.user.rol !== "administrador" && req.user.id.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "No tienes permisos para ver estos datos",
            });
        }

        // 1. Obtener estaciones del cliente
        const [estaciones] = await db.query(`SELECT id_estacion FROM estaciones WHERE id_usuario = ?`, [userId]);

        if (estaciones.length === 0) {
            return res.json({
                success: true,
                data: [],
                message: "No hay estaciones configuradas para este cliente",
            });
        }

        // Lista de IDs de estaciones
        const estacionIds = estaciones.map((est) => est.id_estacion);
        const estacionesIn = estacionIds.join(",");

        // 2. Obtener mediciones recientes (últimos 7 días)
        const [measurements] = await db.query(
            `SELECT 
                ma.*,
                n.parametro,
                n.valor_limite,
                n.unidad
            FROM 
                mediciones_aire ma
            JOIN 
                normas n ON ma.id_norma = n.id_norma
            WHERE 
                ma.id_estacion IN (${estacionesIn})
            AND 
                ma.fecha_muestra >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)
            ORDER BY 
                ma.fecha_muestra DESC, 
                ma.hora_muestra DESC
            LIMIT 50`,
            [],
        );

        // 3. Agrupar por parámetro para gráfico circular
        const paramGroups = {};
        let total = 0;

        measurements.forEach((m) => {
            if (!paramGroups[m.parametro]) {
                paramGroups[m.parametro] = 0;
            }
            paramGroups[m.parametro]++;
            total++;
        });

        const groupedByParameter = Object.keys(paramGroups).map((key) => {
            const count = paramGroups[key];
            // Calcular porcentaje para el gráfico
            const percentage = Math.round((count / total) * 100);
            return {
                name: key,
                value: percentage,
            };
        });

        res.json({
            success: true,
            data: measurements,
            groupedByParameter,
            total: measurements.length,
        });
    } catch (error) {
        console.error("Error al obtener mediciones recientes:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener mediciones recientes",
        });
    }
});

module.exports = router;
