const pool = require("../config/database");
const XLSX = require("xlsx");

const getAvailableDates = async (stationId, parameterId) => {
    try {
        const [rows] = await pool.query(
            `SELECT DISTINCT 
                DATE(fecha_inicio_muestra) as fecha
             FROM mediciones_aire m
             INNER JOIN normas n ON m.id_norma = n.id_norma
             WHERE m.id_estacion = ?
             AND n.parametro = ?
             ORDER BY fecha DESC`,
            [stationId, parameterId],
        );

        console.log("📅 Fechas encontradas en BD:", rows);

        // Convertir las fechas a formato ISO
        const dates = rows.map((row) => {
            const fecha = new Date(row.fecha);
            return fecha.toISOString().split("T")[0];
        });

        console.log("📅 Fechas formateadas:", dates);

        return {
            success: true,
            dates,
            metadata: {
                total: dates.length,
                estacion: stationId,
                parametro: parameterId,
            },
        };
    } catch (error) {
        console.error("❌ Error en getAvailableDates:", error);
        throw error;
    }
};

const getMeasurements = async (req, res) => {
    try {
        const { stationId, parameterId, date } = req.query;

        console.log("📊 Consultando mediciones:", { stationId, parameterId, date });

        // Consulta principal de mediciones con ORDER BY DESC
        const [measurements] = await pool.query(
            `SELECT 
                ma.id_medicion_aire,
                ma.muestra,
                DATE_FORMAT(ma.fecha_muestra, '%d/%m/%Y') as fecha_muestra,
                TIME_FORMAT(ma.hora_muestra, '%l:%i:%s %p') as hora_muestra,
                ma.tiempo_muestreo,
                REPLACE(CAST(ma.concentracion AS DECIMAL(10,2)), '.', ',') as concentracion,
                REPLACE(CAST(ma.u AS DECIMAL(10,4)), '.', ',') as u,
                REPLACE(CAST(ma.u_factor_cobertura AS DECIMAL(10,2)), '.', ',') as u_factor_cobertura,
                n.parametro,
                n.valor_limite,
                n.unidad
             FROM mediciones_aire ma
             JOIN normas n ON ma.id_norma = n.id_norma
             WHERE ma.id_estacion = ? 
             AND n.parametro = ?
             AND DATE(ma.fecha_inicio_muestra) = ?
             ORDER BY CAST(SUBSTRING_INDEX(ma.muestra, '.', -1) AS SIGNED) DESC`,
            [stationId, parameterId, date],
        );

        // Consulta de declaración de conformidad
        const [declaracion] = await pool.query(
            `SELECT * 
             FROM declaraciones_conformidad dc
             JOIN mediciones_aire ma ON dc.id_medicion = ma.id_medicion_aire
             WHERE ma.id_estacion = ? 
             AND DATE(ma.fecha_inicio_muestra) = DATE(?)
             LIMIT 1`,
            [stationId, date],
        );

        // Log para depuración
        console.log(
            "📅 Fechas de mediciones:",
            measurements.map((m) => m.fecha_muestra),
        );

        res.json({
            success: true,
            data: measurements,
            metadata: {
                total: measurements.length,
                declaracionConformidad: declaracion[0] || null,
                norma: {
                    parametro: parameterId,
                    valor_limite: measurements[0]?.valor_limite,
                    unidad: measurements[0]?.unidad,
                },
            },
        });
    } catch (error) {
        console.error("❌ Error:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener mediciones",
        });
    }
};

// Añade esta función auxiliar (falta en tu código)
const isValidDate = (dateString) => {
    if (!dateString) return false;

    // Si es formato DD/MM/YYYY
    const parts = dateString.split("/");
    if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        // Verificar valores razonables
        return year > 2000 && year < 2100 && month > 0 && month <= 12 && day > 0 && day <= 31;
    }
    return false;
};

const processExcelFile = async (buffer, stationId, parameterId, fechaInicioMuestra) => {
    try {
        // REEMPLAZA ESTAS LÍNEAS
        const workbook = XLSX.read(buffer, {
            type: "buffer",
            raw: true, // Forzar lectura de valores sin formatear
            cellText: true, // Forzar lectura como texto
            cellDates: false, // No convertir a objetos Date
            dateNF: "yyyy-mm-dd", // Formato de fecha para reconocimiento
        });

        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // Extraer las celdas como texto crudo sin parseo
        let data;
        try {
            // Primer intento con encabezados automáticos
            data = XLSX.utils.sheet_to_json(worksheet, {
                raw: false,
                defval: "",
            });

            // Si no detecta encabezados, intenta otra estrategia
            if (data.length === 0 || !Object.keys(data[0]).some((h) => h.toLowerCase().includes("muestra") || h.toLowerCase().includes("fecha"))) {
                console.log("⚠️ No se detectaron encabezados correctamente, intentando con primera fila");

                // Intentar usar primera fila como encabezado
                data = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    defval: "",
                    header: 1,
                });

                // Eliminar primera fila (encabezados)
                const headers = data.shift();

                // Convertir a formato objeto con nombres de columna
                data = data.map((row) => {
                    const obj = {};
                    headers.forEach((header, i) => {
                        obj[header] = row[i];
                    });
                    return obj;
                });
            }
        } catch (err) {
            console.error("❌ Error al procesar estructura del Excel:", err);
            // Estrategia de último recurso: leer como posiciones simples
            const rawData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1, // Usar números como encabezados
                raw: false,
            });

            // Crear estructura compatible
            const headers = ["muestra", "fecha_muestra", "hora_muestra", "tiempo_muestreo", "concentracion", "u", "u_factor_cobertura"];
            data = rawData.slice(1).map((row) => {
                const obj = {};
                headers.forEach((header, i) => {
                    obj[header] = row[i] || "";
                });
                return obj;
            });
        }

        // Si aún no hay datos, lanzar error
        if (!data || data.length === 0) {
            throw new Error("No se pudieron extraer datos del archivo Excel");
        }

        // Obtener los encabezados reales
        const headers = Object.keys(data[0]);
        console.log("🔑 Encabezados del Excel:", headers);

        // Mapear los encabezados a índices de columna
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

            console.log("Mapeo corregido:", headerMap);
        }

        // Validación final de los datos procesados
        const resultado = data.map((row, index) => {
            // PROCESAMIENTO DE FECHA - MÉTODO MEJORADO
            let fechaFormateada = fechaInicioMuestra; // Valor predeterminado

            if (row[headerMap.fecha]) {
                try {
                    // Convertir CUALQUIER formato de fecha a texto plano
                    const fechaTexto = String(row[headerMap.fecha]).trim();
                    console.log(`📅 Fecha original (${typeof fechaTexto}): "${fechaTexto}"`);

                    // Si es un número (fecha serial de Excel)
                    if (!isNaN(fechaTexto) && !fechaTexto.includes("/")) {
                        console.log(`🔢 Fecha serial de Excel: ${fechaTexto}`);

                        // Convertir fecha serial de Excel a formato YYYY-MM-DD
                        // Excel: 1 = 1 de enero de 1900
                        try {
                            // Ajuste: Excel considera erróneamente 1900 como año bisiesto
                            let diasDesde1900 = parseInt(fechaTexto) - 1;
                            if (diasDesde1900 > 59) diasDesde1900 -= 1;

                            const fecha = new Date(1900, 0, diasDesde1900);
                            const anio = fecha.getFullYear();
                            const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
                            const dia = fecha.getDate().toString().padStart(2, "0");

                            fechaFormateada = `${anio}-${mes}-${dia}`;
                            console.log(`✅ Fecha serial convertida: ${fechaFormateada}`);
                        } catch (err) {
                            console.error(`❌ Error convirtiendo fecha serial: ${err.message}`);
                            fechaFormateada = fechaInicioMuestra;
                        }
                    }
                    // Si tiene formato DD/MM/YYYY (mantener código existente)
                    else if (fechaTexto.includes("/")) {
                        const partes = fechaTexto.split("/");
                        if (partes.length === 3) {
                            const dia = partes[0].padStart(2, "0");
                            const mes = partes[1].padStart(2, "0");
                            const anio = partes[2];
                            fechaFormateada = `${anio}-${mes}-${dia}`;
                            console.log(`✅ Fecha convertida: ${fechaFormateada}`);
                        }
                    }
                } catch (error) {
                    console.error(`❌ Error procesando fecha: ${error.message}`);
                }
            }

            // Resto del procesamiento (hora y campos numéricos)
            let horaFormateada = "00:00:00";
            if (row[headerMap.hora]) {
                // Código de procesamiento de hora...
                const horaRaw = String(row[headerMap.hora]);
                let [horas, resto] = horaRaw.split(":");
                let minutos = "00";
                if (resto) {
                    minutos = resto.split(" ")[0] || "00";
                }

                // Convertir formato 12h a 24h
                horas = parseInt(horas, 10);
                if (horaRaw.toLowerCase().includes("p.m.") || horaRaw.toLowerCase().includes("pm")) {
                    if (horas !== 12) horas += 12;
                } else if (horaRaw.toLowerCase().includes("a.m.") || horaRaw.toLowerCase().includes("am")) {
                    if (horas === 12) horas = 0;
                }

                horaFormateada = `${String(horas).padStart(2, "0")}:${minutos.padStart(2, "0")}:00`;
            }

            // Limpiar valores numéricos (reemplazar coma por punto)
            const limpiarNumero = (valor) => {
                if (!valor) return "0";
                return String(valor).replace(",", ".");
            };

            // Objeto final a retornar
            const medicion = {
                id_estacion: stationId,
                id_norma: parameterId,
                muestra: row[headerMap.muestra] || `Muestra ${index + 1}`,
                fecha_muestra: fechaFormateada,
                hora_muestra: horaFormateada,
                tiempo_muestreo: parseFloat(limpiarNumero(row[headerMap.tiempo] || 0)),
                concentracion: limpiarNumero(row[headerMap.concentracion] || 0),
                u: limpiarNumero(row[headerMap.u] || 0),
                u_factor_cobertura: limpiarNumero(row[headerMap.uFactor] || 0),
                fecha_inicio_muestra: fechaInicioMuestra,
            };

            // Verificación final de valores
            if (!medicion.fecha_muestra || medicion.fecha_muestra === "0000-00-00") {
                console.warn(`⚠️ Fila ${index + 1}: fecha inválida, usando fecha general`);
                medicion.fecha_muestra = fechaInicioMuestra;
            }

            return medicion;
        });

        // Filtrar filas vacías o inválidas
        return resultado.filter((r) => r && r.muestra);
    } catch (error) {
        console.error("❌ Error general procesando Excel:", error);
        throw error;
    }
};

const uploadMeasurements = async (req, res) => {
    try {
        const { stationId, parameterId, fecha_inicio_muestra } = req.body;
        const file = req.file;

        if (!file || !stationId || !parameterId || !fecha_inicio_muestra) {
            return res.status(400).json({
                success: false,
                message: "Faltan datos requeridos",
            });
        }

        console.log("📤 Procesando archivo para:", {
            estación: stationId,
            parámetro: parameterId,
            fecha: fecha_inicio_muestra,
            tamaño_archivo: file.size,
        });

        // Procesar archivo Excel
        try {
            const measurements = await processExcelFile(file.buffer, stationId, parameterId, fecha_inicio_muestra);

            // Verificar si hay datos
            if (!measurements || measurements.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "El archivo no contiene datos válidos",
                });
            }

            console.log(`✓ Procesadas ${measurements.length} filas del Excel`);

            // Verificar datos antes de insertar (para depuración)
            measurements.forEach((m, i) => {
                console.log(`Medición #${i + 1}: fecha=${m.fecha_muestra}, muestra=${m.muestra}`);
            });

            // Validar fechas antes de insertar
            const fechasInvalidas = measurements.filter((m) => !m.fecha_muestra || m.fecha_muestra === "0000-00-00");
            if (fechasInvalidas.length > 0) {
                console.warn(`⚠️ Hay ${fechasInvalidas.length} filas con fechas inválidas`);
                // Usar fecha_inicio_muestra como fecha por defecto
                fechasInvalidas.forEach((m) => {
                    m.fecha_muestra = fecha_inicio_muestra;
                });
            }

            // Insertar en la base de datos
            const [result] = await pool.query(
                `INSERT INTO mediciones_aire 
                (id_estacion, id_norma, muestra, fecha_muestra, hora_muestra, 
                 tiempo_muestreo, concentracion, u, u_factor_cobertura, fecha_inicio_muestra) 
                VALUES ?`,
                [
                    measurements.map((m) => [
                        m.id_estacion,
                        m.id_norma,
                        m.muestra || "SN",
                        m.fecha_muestra || fecha_inicio_muestra,
                        m.hora_muestra || "00:00:00",
                        m.tiempo_muestreo || 0,
                        m.concentracion || 0,
                        m.u || 0,
                        m.u_factor_cobertura || 0,
                        m.fecha_inicio_muestra,
                    ]),
                ],
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
        } catch (processingError) {
            console.error("❌ Error procesando Excel:", processingError);
            return res.status(400).json({
                success: false,
                message: "Error procesando el archivo Excel: " + processingError.message,
                error: processingError.stack,
            });
        }
    } catch (error) {
        console.error("❌ Error general en upload:", error);
        res.status(500).json({
            success: false,
            message: "Error al procesar el archivo: " + error.message,
            error: error.stack,
        });
    }
};

module.exports = {
    getMeasurements,
    getAvailableDates,
    uploadMeasurements,
    processExcelFile,
};
