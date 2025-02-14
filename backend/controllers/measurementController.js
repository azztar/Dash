const xlsx = require("xlsx");
const db = require("../config/database");
const moment = require("moment");

// Configurar el idioma de moment
moment.locale("es");

// Función de error (erf) para cálculos estadísticos
function erf(x) {
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
}

// Agregar esta nueva función de validación
const validateNumber = (value, fieldName) => {
    const num = parseFloat(String(value).replace(",", "."));
    if (isNaN(num)) {
        throw new Error(`Valor inválido para ${fieldName}: ${value}`);
    }
    return num;
};

// Modificar la función convertExcelDateToJS
const convertExcelDateToJS = (excelDate) => {
    try {
        // Excel usa 1900 como año base
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date;
    } catch (error) {
        console.error("Error convertiendo fecha Excel:", error);
        return null;
    }
};

// Modificar la función formatearFecha
const formatearFecha = (fechaStr) => {
    try {
        // Separar la fecha
        const partes = fechaStr.split("/");
        if (partes.length !== 3) {
            throw new Error("Formato de fecha inválido");
        }

        // Ahora viene como día/mes/año
        let [dia, mes, año] = partes;

        // Convertir a números para validación
        dia = parseInt(dia);
        mes = parseInt(mes);
        año = parseInt(año);

        // Validar rangos
        if (mes < 1 || mes > 12) throw new Error(`Mes inválido: ${mes}`);
        if (dia < 1 || dia > 31) throw new Error(`Día inválido: ${dia}`);

        // Formatear con ceros a la izquierda
        const diaStr = dia.toString().padStart(2, "0");
        const mesStr = mes.toString().padStart(2, "0");

        // Retornar en formato YYYY-MM-DD
        return `${año}-${mesStr}-${diaStr}`;
    } catch (error) {
        throw new Error(`Error al formatear fecha "${fechaStr}": ${error.message}`);
    }
};

// Actualizar la función processExcelData
const processExcelData = (data) => {
    return data.map((row) => {
        try {
            // Agregar logs para depuración
            console.log("Procesando fecha:", row["fecha_muestra"]);
            const fechaOriginal = row["fecha_muestra"].trim();
            console.log("Fecha después de trim:", fechaOriginal);

            // Continuar con el formateo
            const fechaFormateada = formatearFecha(fechaOriginal);

            // Validar la fecha con moment
            const fechaValida = moment(fechaFormateada, "YYYY-MM-DD", true);
            if (!fechaValida.isValid()) {
                console.log("Fecha original:", fechaOriginal);
                console.log("Fecha formateada:", fechaFormateada);
                throw new Error(`Fecha no válida: ${fechaOriginal}`);
            }

            // Limpiar y formatear hora
            let horaStr = String(row["hora_muestra"])
                .trim()
                .replace(/\s+/g, " ")
                .replace(/a\.\s*m\./i, "AM")
                .replace(/p\.\s*m\./i, "PM")
                .trim();

            // Intentar parsear la hora
            const horaValida = moment(horaStr, ["h:mm:ss A"], true);
            if (!horaValida.isValid()) {
                throw new Error(`Hora no válida: ${row["hora_muestra"]} (procesada como: ${horaStr})`);
            }

            // Convertir los valores numéricos
            const tiempo_muestreo = validateNumber(String(row["tiempo_muestreo"]).replace(",", "."), "tiempo_muestreo");
            const concentracion = validateNumber(String(row["concentracion"]).replace(",", "."), "concentracion");
            const u = validateNumber(String(row["u"]).replace(",", "."), "u");
            const u_factor_cobertura = validateNumber(String(row["u_factor_cobertura"]).replace(",", "."), "u_factor_cobertura");
            const norma = validateNumber(String(row["norma"]).replace(",", "."), "norma");

            return {
                muestra: row["muestra"],
                fecha_muestra: fechaFormateada, // Ya está en formato YYYY-MM-DD
                hora_muestra: horaValida.format("HH:mm:ss"),
                tiempo_muestreo,
                concentracion,
                u,
                u_factor_cobertura,
                norma,
            };
        } catch (error) {
            console.log("Error procesando fila:", row);
            console.error("Detalles del error:", error);
            throw new Error(`Error procesando la fila: ${error.message}`);
        }
    });
};

const uploadMeasurements = async (req, res) => {
    const connection = await db.getConnection();

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No se proporcionó ningún archivo",
            });
        }

        const { clientId, stationId, parameterId, date } = req.body;

        if (!clientId || !stationId || !parameterId || !date) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos en el formulario",
            });
        }

        // Convertir stationId a numero_estacion (1-4)
        const numero_estacion = String(Math.min(Math.max(parseInt(stationId), 1), 4));

        // Verificar/Crear estación
        const [estacion] = await connection.query(
            `INSERT INTO estaciones (id_usuario, numero_estacion, nombre_estacion) 
             VALUES (?, ?, ?) 
             ON DUPLICATE KEY UPDATE id_estacion = LAST_INSERT_ID(id_estacion)`,
            [clientId, numero_estacion, `Estación ${numero_estacion}`],
        );

        const finalStationId = estacion.insertId || estacion.id_estacion;

        // Modificar la lectura del Excel en uploadMeasurements
        const workbook = xlsx.read(req.file.buffer, {
            type: "buffer",
            cellDates: true,
            raw: true,
        });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: "",
            blankrows: false,
        });

        const processedData = processExcelData(rawData);

        await connection.beginTransaction();

        // Validar que haya 18 muestras
        if (processedData.length !== 18) {
            return res.status(400).json({
                success: false,
                message: "El archivo debe contener exactamente 18 muestras",
            });
        }

        // Validar la secuencia de muestras
        const validMuestraPattern = /^1\.(1[0-8]|[1-9])$/;
        const muestras = processedData.map((row) => row.muestra);
        const muestrasValidas = muestras.every((muestra) => validMuestraPattern.test(muestra));

        if (!muestrasValidas) {
            return res.status(400).json({
                success: false,
                message: "Las muestras deben seguir el formato 1.1 hasta 1.18",
            });
        }

        try {
            // Obtener la norma específica para el parámetro
            const [normas] = await connection.query("SELECT id_norma, valor_limite FROM normas WHERE id_usuario = ? AND parametro = ?", [
                clientId,
                parameterId,
            ]);

            // Modificar el objeto valorLimiteDefecto
            const valorLimiteDefecto = {
                PM10: { limite: 50, periodo: "24h" },
                "PM2.5": { limite: 25, periodo: "24h" },
                SO2: { limite: 250, periodo: "24h" },
                NO2: { limite: 200, periodo: "1h" },
                O3: { limite: 100, periodo: "8h" },
                CO: { limite: 35000, periodo: "1h" },
            };

            // Modificar la inserción de normas
            if (normas.length === 0) {
                const parametroConfig = valorLimiteDefecto[parameterId] || { limite: 50, periodo: "24h" };

                const [newNorma] = await connection.query(
                    `INSERT INTO normas (id_usuario, parametro, valor_limite, periodo_medicion)
                     VALUES (?, ?, ?, ?)`,
                    [clientId, parameterId, parametroConfig.limite, parametroConfig.periodo],
                );

                normas.push({
                    id_norma: newNorma.insertId,
                    valor_limite: parametroConfig.limite,
                });
            }

            for (const row of processedData) {
                // Insertar medición
                const [measurementResult] = await connection.query(
                    `INSERT INTO mediciones_aire 
                     (id_estacion, id_norma, muestra, fecha_muestra, hora_muestra,
                      tiempo_muestreo, concentracion, u, u_factor_cobertura, 
                      fecha_inicio_muestra)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        finalStationId,
                        normas[0].id_norma,
                        row.muestra,
                        row.fecha_muestra,
                        row.hora_muestra,
                        row.tiempo_muestreo,
                        row.concentracion,
                        row.u,
                        row.u_factor_cobertura,
                        date,
                    ],
                );

                // Calcular valores para declaración de conformidad
                const media_concentracion = row.concentracion;
                const valorLimite = normas[0].valor_limite;
                const u = row.u || 0;
                const k = row.u_factor_cobertura || 2;

                // Calcular probabilidad de conformidad
                const z = (valorLimite - media_concentracion) / (u * k);
                const probabilidad_conformidad = (1 - 0.5 * (1 + erf(z / Math.sqrt(2)))) * 100;

                // Determinar regla de decisión
                const regla_decision = probabilidad_conformidad >= 95 ? "Conforme" : "No conforme";

                // Calcular probabilidad de aceptación falsa
                const probabilidad_aceptacion_falsa = regla_decision === "Conforme" ? 100 - probabilidad_conformidad : probabilidad_conformidad;

                // Insertar declaración de conformidad con valores calculados
                await connection.query(
                    `INSERT INTO declaraciones_conformidad 
                     (id_medicion, media_concentracion, probabilidad_aceptacion_falsa,
                      probabilidad_conformidad, regla_decision)
                     VALUES (?, ?, ?, ?, ?)`,
                    [measurementResult.insertId, media_concentracion, probabilidad_aceptacion_falsa, probabilidad_conformidad, regla_decision],
                );
            }

            await connection.commit();
            res.json({
                success: true,
                message: "Datos cargados exitosamente",
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        }
    } catch (error) {
        await connection.rollback();
        console.error("Error en uploadMeasurements:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error al procesar el archivo",
        });
    } finally {
        connection.release();
    }
};

module.exports = {
    uploadMeasurements,
};
