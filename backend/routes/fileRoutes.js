const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const db = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

// Intenta cargar AdmZip solo si está disponible
let AdmZip;
try {
    AdmZip = require("adm-zip");
} catch (err) {
    console.log("AdmZip no está instalado, no se usará para archivos ZIP");
}

// Asegurar que el directorio de uploads exista
const ensureUploadDirExists = () => {
    const baseUploadDir = path.resolve(__dirname, "..", "uploads");
    if (!fs.existsSync(baseUploadDir)) {
        fs.mkdirSync(baseUploadDir, { recursive: true });
    }
    return baseUploadDir;
};

// Crear directorio base
ensureUploadDirExists();

// Configuración de multer optimizada para archivos binarios
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const clientId = req.body.clientId || "default";
        const uploadDir = path.join(ensureUploadDirExists(), clientId);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Preservar extensión original
        const originalExt = path.extname(file.originalname);
        const clientId = req.body.clientId || "default";
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${clientId}_${uniqueSuffix}${originalExt}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [".zip", ".rar", ".7z", ".tar", ".gz", ".tar.gz"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        return cb(null, true);
    }
    cb(new Error("Solo se permiten archivos comprimidos: ZIP, RAR, 7Z, TAR.GZ"));
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter,
});

// RUTA SUBIDA
router.post("/upload", authMiddleware, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No se ha subido ningún archivo",
            });
        }

        const file = req.file;
        // Verificar que el usuario esté disponible
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Usuario no autenticado o identificado correctamente",
            });
        }

        const userId = req.user.id;
        const { clientId, stationId } = req.body;

        console.log("📤 Archivo subido:", {
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype,
            extension: path.extname(file.originalname),
            tamaño: file.size,
            userId: userId, // Mostrar ID de usuario para debug
        });

        // Guardar en BD con ruta absoluta para Windows
        const filePath = path.resolve(file.path).replace(/\\/g, "\\\\");

        const [result] = await db.query(
            `INSERT INTO archivos 
             (nombre_original, nombre_archivo, ruta_archivo, tipo_archivo, 
              tamano, id_usuario, id_cliente, id_estacion) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                file.originalname,
                file.filename,
                filePath,
                path.extname(file.originalname),
                file.size,
                userId, // Asegurar que esto no sea null
                clientId || null,
                stationId || null,
            ],
        );

        res.json({
            success: true,
            message: "Archivo subido correctamente",
            fileId: result.insertId,
            file: {
                nombre: file.originalname,
                tipo: path.extname(file.originalname),
            },
        });
    } catch (error) {
        console.error("Error al subir archivo:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error al subir el archivo",
        });
    }
});

// RUTA DESCARGA
router.get("/download/:fileId", authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.rol === "administrador";

        // Obtener información del archivo
        const [files] = await db.query(
            `SELECT a.* FROM archivos a 
             WHERE a.id_archivo = ? AND (a.id_cliente = ? OR a.id_usuario = ? OR ?)`,
            [fileId, userId, userId, isAdmin],
        );

        if (files.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Archivo no encontrado o sin permisos",
            });
        }

        const file = files[0];
        const filePath = file.ruta_archivo;
        const originalName = file.nombre_original;

        // Verificar existencia física del archivo
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "El archivo físico no se encuentra en el servidor",
            });
        }

        // Mapeo explícito y más específico de extensiones a MIME types
        const mimeTypes = {
            ".zip": "application/zip",
            ".rar": "application/x-rar-compressed", // Cambiado para mayor compatibilidad
            ".7z": "application/x-7z-compressed",
            ".tar": "application/x-tar",
            ".gz": "application/gzip",
            ".tar.gz": "application/x-gtar",
        };

        const extension = path.extname(originalName).toLowerCase();
        const mimeType = mimeTypes[extension] || "application/octet-stream";

        console.log("📥 Descargando archivo:", {
            id: file.id_archivo,
            nombre: originalName,
            extension: extension,
            mimetype: mimeType,
        });

        // Enfoque directo: enviar el archivo con res.download() de Express
        // Este método maneja automáticamente las cabeceras y el streaming
        return res.download(
            filePath,
            originalName,
            {
                headers: {
                    "Content-Type": mimeType,
                    "Content-Transfer-Encoding": "binary",
                    "Content-Disposition": `attachment; filename="${encodeURIComponent(originalName)}"`,
                },
            },
            (err) => {
                if (err) {
                    console.error("Error en la descarga:", err);
                    // Solo enviar error si no se ha enviado ya una respuesta
                    if (!res.headersSent) {
                        return res.status(500).json({
                            success: false,
                            message: "Error al descargar el archivo",
                        });
                    }
                }
            },
        );
    } catch (error) {
        console.error("Error al descargar archivo:", error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message || "Error al descargar el archivo",
            });
        }
    }
});

// Modificar la ruta de listado para filtrar por cliente
router.get("/list", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id;
        const isAdmin = req.user.rol === "administrador";

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

        // Si es admin y hay clientId, filtrar por ese cliente
        if (isAdmin && req.query.clientId) {
            query += ` AND a.id_cliente = ?`;
            params.push(req.query.clientId);
        }
        // Si no es admin, solo mostrar sus archivos
        else if (!isAdmin) {
            query += ` AND a.id_cliente = ?`;
            params.push(userId);
        }

        query += ` ORDER BY a.fecha_carga DESC`;

        const [files] = await db.query(query, params);

        res.json({
            success: true,
            files: files,
        });
    } catch (error) {
        console.error("Error al listar archivos:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener archivos",
        });
    }
});

// Ruta para eliminar archivo
router.delete("/:fileId", authMiddleware, async (req, res) => {
    try {
        const { fileId } = req.params;
        const userId = req.user.id;
        const isAdmin = req.user.rol === "administrador";

        // Verificar si el archivo existe y los permisos
        const [file] = await db.query(`SELECT * FROM archivos WHERE id_archivo = ? AND (id_usuario = ? OR ?)`, [fileId, userId, isAdmin]);

        if (file.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Archivo no encontrado o sin permisos",
            });
        }

        // Eliminar el archivo físico
        if (fs.existsSync(file[0].ruta_archivo)) {
            fs.unlinkSync(file[0].ruta_archivo);
        }

        // Eliminar el registro de la base de datos
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
});

module.exports = router;
