const xlsx = require("xlsx");
const db = require("../config/database");

const uploadMeasurements = async (req, res) => {
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
                message: "Faltan datos requeridos",
            });
        }

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Validar que haya 18 muestras
        if (data.length !== 18) {
            return res.status(400).json({
                success: false,
                message: "El archivo debe contener exactamente 18 muestras",
            });
        }

        // Validar la secuencia de muestras
        const validMuestraPattern = /^1\.(1[0-8]|[1-9])$/;
        const muestras = data.map((row) => row.muestra);
        const muestrasValidas = muestras.every((muestra) => validMuestraPattern.test(muestra));

        if (!muestrasValidas) {
            return res.status(400).json({
                success: false,
                message: "Las muestras deben seguir el formato 1.1 hasta 1.18",
            });
        }

        // Iniciar transacción
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            // Asegurarse que existe la estación o crearla
            const [estacion] = await connection.query(
                `INSERT INTO estaciones (id_usuario, numero_estacion, nombre_estacion) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE id_estacion = LAST_INSERT_ID(id_estacion)`,
                [clientId, req.body.numeroEstacion, `Estación ${req.body.numeroEstacion}`],
            );

            const stationId = estacion.insertId || estacion.id_estacion;

            // Obtener la norma específica para el parámetro
            const [normas] = await connection.query("SELECT id_norma FROM normas WHERE id_usuario = ? AND parametro = ?", [clientId, parameterId]);

            if (normas.length === 0) {
                throw new Error(`No se encontró una norma válida para el parámetro ${parameterId}`);
            }

            for (const row of data) {
                // Insertar medición
                const [measurementResult] = await connection.query(
                    `INSERT INTO mediciones_aire 
                     (id_estacion, id_norma, muestra, fecha_hora_inicial, 
                      tiempo_muestreo, concentracion, u, u_factor_cobertura, 
                      fecha_inicio_muestra)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        stationId,
                        normas[0].id_norma,
                        row.muestra,
                        row.fecha_hora_inicial,
                        row.tiempo_muestreo,
                        row.concentracion,
                        row.u,
                        row.u_factor_cobertura,
                        date,
                    ],
                );

                // Insertar declaración de conformidad
                await connection.query(
                    `INSERT INTO declaraciones_conformidad 
                     (id_medicion, media_concentracion, probabilidad_aceptacion_falsa,
                      probabilidad_conformidad, regla_decision)
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        measurementResult.insertId,
                        row.media_concentracion,
                        row.probabilidad_aceptacion_falsa,
                        row.probabilidad_conformidad,
                        row.regla_decision,
                    ],
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
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Error al procesar archivo:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error al procesar el archivo",
        });
    }
};

module.exports = {
    uploadMeasurements,
};
