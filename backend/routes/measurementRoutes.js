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
function parseFechaHora(fecha, hora) {
    // Verificar que fecha y hora no sean undefined
    if (!fecha) {
        console.log("⚠️ Fecha vacía o undefined");
        return { fecha: null, hora: null };
    }

    // Convertir fecha a string si es número (fecha serial de Excel)
    const fechaStr = String(fecha).trim();
    let fechaFormateada = null;

    try {
        if (fechaStr.includes("/")) {
            // Formato DD/MM/YYYY
            const partes = fechaStr.split("/");
            if (partes.length === 3) {
                const dia = String(partes[0]).padStart(2, "0");
                const mes = String(partes[1]).padStart(2, "0");
                const anio = partes[2];
                fechaFormateada = `${anio}-${mes}-${dia}`;
            } else {
                console.log(`⚠️ Formato de fecha incorrecto: ${fechaStr}`);
            }
        } else if (!isNaN(fechaStr)) {
            // Es un número (fecha serial de Excel)
            let diasDesde1900 = parseInt(fechaStr) - 1;
            if (diasDesde1900 > 59) diasDesde1900 -= 1; // Ajuste por error de Excel

            // SOLUCIÓN: Crear fecha con UTC para evitar ajustes de zona horaria
            const msDesde1900 = diasDesde1900 * 24 * 60 * 60 * 1000;
            const fechaBase = new Date(Date.UTC(1900, 0, 1)); // 1 de enero de 1900 en UTC
            const fechaFinal = new Date(fechaBase.getTime() + msDesde1900);

            // Extraer componentes de fecha en UTC para evitar ajustes de zona horaria
            const anio = fechaFinal.getUTCFullYear();
            const mes = (fechaFinal.getUTCMonth() + 1).toString().padStart(2, "0");
            const dia = fechaFinal.getUTCDate().toString().padStart(2, "0");

            fechaFormateada = `${anio}-${mes}-${dia}`;
            console.log(`📅 Fecha serial ${fechaStr} convertida a: ${fechaFormateada}`);
        }
    } catch (error) {
        console.error(`❌ Error procesando fecha: ${error.message}`);
    }

    // El resto de la función se mantiene igual...
    // ... código para procesar hora ...

    // Procesar hora
    let horaFormateada = "00:00:00"; // Valor predeterminado

    if (hora) {
        try {
            const horaStr = String(hora).trim();
            let [horas, resto] = horaStr.split(":");
            let minutos = "00";

            if (resto) {
                minutos = resto.split(" ")[0] || "00";
            }

            horas = parseInt(horas, 10) || 0;

            // Convertir AM/PM a formato 24h
            if (horaStr.toLowerCase().includes("p.m.") || horaStr.toLowerCase().includes("pm") || horaStr.toLowerCase().includes("p. m.")) {
                if (horas !== 12) horas += 12;
            } else if (
                (horaStr.toLowerCase().includes("a.m.") || horaStr.toLowerCase().includes("am") || horaStr.toLowerCase().includes("a. m.")) &&
                horas === 12
            ) {
                horas = 0;
            }

            horaFormateada = `${String(horas).padStart(2, "0")}:${minutos.padStart(2, "0")}:00`;
            console.log(`⏰ Hora "${horaStr}" convertida a: ${horaFormateada}`);
        } catch (error) {
            console.error(`❌ Error procesando hora: ${error.message}`);
            horaFormateada = "00:00:00";
        }
    }

    // Tu return existente
    return {
        fecha: fechaFormateada,
        hora: horaFormateada,
    };
}

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

        // Añadir esto: Definir headerMap antes de usarlo
        const headers = Object.keys(data[0] || {});
        console.log("🔑 Encabezados del Excel:", headers);

        const headerMap = {
            muestra: headers.find((h) => h.toLowerCase().includes("muestra")),
            fecha: headers.find((h) => h.toLowerCase().includes("fecha")),
            hora: headers.find((h) => h.toLowerCase().includes("hora")),
            tiempo: headers.find((h) => h.toLowerCase().includes("tiempo")),
            concentracion: headers.find((h) => h.toLowerCase().includes("conce")),
            u: headers.find((h) => h === "u" || h === "U"),
            uFactor: headers.find((h) => h.toLowerCase().includes("factor")),
        };

        console.log("🗺️ Mapeo de columnas:", headerMap);
        console.log("📑 Primera fila:", data[0]);

        // Verificar que todas las columnas necesarias existan
        if (!headerMap.muestra || !headerMap.fecha || !headerMap.tiempo || !headerMap.concentracion || !headerMap.u || !headerMap.uFactor) {
            console.error("❌ Error: No se encontraron todos los encabezados necesarios");
            console.log("Encabezados disponibles:", headers);
            console.log("Mapeo encontrado:", headerMap);

            // Intento de corrección automática - usar posiciones por defecto
            if (!headerMap.muestra) headerMap.muestra = headers[0];
            if (!headerMap.fecha) headerMap.fecha = headers[1];
            if (!headerMap.hora) headerMap.hora = headers[2];
            if (!headerMap.tiempo) headerMap.tiempo = headers[3];
            if (!headerMap.concentracion) headerMap.concentracion = headers[4];
            if (!headerMap.u) headerMap.u = headers[5];
            if (!headerMap.uFactor) headerMap.uFactor = headers[6];

            console.log("🔄 Mapeo corregido:", headerMap);
        }

        // 4. Preparar los datos para inserción con mejor manejo de errores
        const processedData = data.map((row, i) => {
            const processed = parseFechaHora(row[headerMap.fecha], row[headerMap.hora]);
            if (!processed.fecha) {
                console.log(`⚠️ Usando fecha predeterminada para fila ${i + 1}`);
                processed.fecha = fecha_inicio_muestra;
            }

            // Función para manejar valores numéricos con posibles comas
            const processNumber = (value) => {
                if (!value) return 0;
                return parseFloat(String(value).replace(",", ".")) || 0;
            };

            return [
                stationId,
                normaId,
                row[headerMap.muestra] || `Muestra ${i + 1}`,
                processed.fecha,
                processed.hora,
                processNumber(row[headerMap.tiempo]),
                processNumber(row[headerMap.concentracion]),
                processNumber(row[headerMap.u]),
                processNumber(row[headerMap.uFactor]),
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

        // 2. Obtener mediciones recientes (últimos 365 días)
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
                ma.fecha_muestra >= DATE_SUB(CURRENT_DATE, INTERVAL 365 DAY)
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

        // 4. Obtener límites de normas para cada parámetro
        const normaLimitsMap = {};
        const parametersArray = Object.keys(paramGroups);

        if (parametersArray.length > 0) {
            const [normas] = await db.query(
                `SELECT parametro, valor_limite, unidad  
                 FROM normas
                 WHERE id_usuario = ? AND parametro IN (?)`,
                [userId, parametersArray],
            );

            normas.forEach((norma) => {
                normaLimitsMap[norma.parametro] = {
                    limit: parseFloat(norma.valor_limite),
                    unit: norma.unidad,
                };
            });
        }

        res.json({
            success: true,
            data: measurements,
            groupedByParameter,
            parametersLimits: normaLimitsMap, // ¡Nueva información!
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
