const db = require("../config/database");
const path = require("path");
const fs = require("fs");

/**
 * Registra información del archivo en la base de datos
 * Esta función trabaja con archivos subidos al sistema local
 */
exports.registerFile = async (req, res) => {
    try {
        const { nombre_original, storage_path, storage_url, tipo_archivo, tamano, id_cliente, id_estacion, id_norma, fecha_medicion } = req.body;

        // Validar datos mínimos
        if (!nombre_original || !storage_path) {
            return res.status(400).json({
                success: false,
                message: "Información incompleta del archivo",
            });
        }

        // Insertar en la base de datos
        const [result] = await db.query(
            `INSERT INTO archivos 
             (nombre_original, storage_provider, ruta_archivo, url_descarga, tipo_archivo, 
              tamano, id_usuario, id_cliente, id_estacion, id_norma, fecha_medicion) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                nombre_original,
                "local",
                storage_path,
                storage_url || null,
                tipo_archivo || path.extname(nombre_original),
                tamano || 0,
                req.user?.id || null,
                id_cliente || (req.user?.rol === "cliente" ? req.user?.id : null),
                id_estacion || null,
                id_norma || null,
                fecha_medicion || new Date().toISOString().split("T")[0],
            ],
        );

        res.status(201).json({
            success: true,
            message: "Archivo registrado correctamente",
            fileId: result.insertId,
        });
    } catch (error) {
        console.error("Error al registrar archivo:", error);
        res.status(500).json({
            success: false,
            message: "Error al registrar el archivo en la base de datos",
        });
    }
};

/**
 * Obtiene la URL de un archivo para descarga/visualización
 * Funciona con archivos locales
 */
exports.getFileUrl = async (req, res) => {
    try {
        const fileId = req.params.id;

        // Consultar información del archivo
        const [files] = await db.query(`SELECT * FROM archivos WHERE id_archivo = ?`, [fileId]);

        if (files.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Archivo no encontrado",
            });
        }

        const file = files[0];

        // Para archivos locales, generar una URL temporal
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        const downloadUrl = `${baseUrl}/api/files/download/${fileId}?token=${req.query.token || ""}`;

        return res.json({
            success: true,
            downloadUrl,
            provider: "local",
        });
    } catch (error) {
        console.error("Error al obtener URL del archivo:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener URL del archivo",
        });
    }
};

/**
 * Elimina un archivo (tanto de la BD como del almacenamiento)
 */
exports.deleteFile = async (req, res) => {
    try {
        const fileId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.rol === "administrador";

        // Verificar existencia y permisos
        const [files] = await db.query(`SELECT * FROM archivos WHERE id_archivo = ? AND (id_usuario = ? OR ?)`, [fileId, userId, isAdmin]);

        if (files.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Archivo no encontrado o sin permisos para eliminar",
            });
        }

        const file = files[0];

        // Eliminar el archivo físico si existe en el sistema local
        if (file.ruta_archivo) {
            try {
                if (fs.existsSync(file.ruta_archivo)) {
                    fs.unlinkSync(file.ruta_archivo);
                }
            } catch (fsError) {
                console.warn("No se pudo eliminar el archivo físico:", fsError.message);
                // Continuamos con la eliminación del registro aunque no se haya podido borrar el archivo
            }
        }

        // Eliminar de la base de datos
        await db.query(`DELETE FROM archivos WHERE id_archivo = ?`, [fileId]);

        res.json({
            success: true,
            message: "Archivo eliminado correctamente",
        });
    } catch (error) {
        console.error("Error al eliminar archivo:", error);
        res.status(500).json({
            success: false,
            message: "Error al eliminar el archivo",
        });
    }
};

/**
 * Lista archivos con filtros mejorados
 */
exports.listFiles = async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.rol === "administrador";
        const { clientId, estacionId, tipo, desde, hasta } = req.query;

        let query = `
            SELECT 
                a.*,
                u.nombre_empresa as cliente_nombre,
                u.nombre_usuario,
                e.nombre_estacion
            FROM archivos a
            LEFT JOIN usuarios u ON a.id_cliente = u.id_usuario
            LEFT JOIN estaciones e ON a.id_estacion = e.id_estacion
            WHERE 1=1
        `;

        const params = [];

        // Filtro por cliente
        if (isAdmin && clientId) {
            query += ` AND a.id_cliente = ?`;
            params.push(clientId);
        } else if (!isAdmin) {
            query += ` AND a.id_cliente = ?`;
            params.push(userId);
        }

        // Filtro por estación
        if (estacionId) {
            query += ` AND a.id_estacion = ?`;
            params.push(estacionId);
        }

        // Filtro por tipo de archivo
        if (tipo) {
            query += ` AND a.tipo_archivo = ?`;
            params.push(tipo);
        }

        // Filtro por fecha
        if (desde) {
            query += ` AND a.fecha_carga >= ?`;
            params.push(desde);
        }

        if (hasta) {
            query += ` AND a.fecha_carga <= ?`;
            params.push(hasta);
        }

        // Ordenar por fecha de carga (más reciente primero)
        query += ` ORDER BY a.fecha_carga DESC`;

        const [files] = await db.query(query, params);

        res.json({
            success: true,
            total: files.length,
            files: files,
        });
    } catch (error) {
        console.error("Error al listar archivos:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener lista de archivos",
        });
    }
};
