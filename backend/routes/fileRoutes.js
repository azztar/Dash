const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mime = require("mime-types");
const db = require("../config/database");
const { authMiddleware } = require("../middleware/authMiddleware");

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
        try {
            // Verificar si clientId existe y es válido
            const clientId = req.body.id_cliente || (req.user ? req.user.id : "default");

            // Crear un directorio base seguro
            const baseUploadDir = path.resolve(__dirname, "..", "uploads");
            if (!fs.existsSync(baseUploadDir)) {
                fs.mkdirSync(baseUploadDir, { recursive: true });
            }

            // Crear directorio específico para el cliente
            const uploadDir = path.join(baseUploadDir, clientId.toString());
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            cb(null, uploadDir);
        } catch (error) {
            console.error("Error al crear directorio de destino:", error);
            // Usar directorio por defecto si hay error
            const fallbackDir = path.resolve(__dirname, "..", "uploads", "default");
            if (!fs.existsSync(fallbackDir)) {
                fs.mkdirSync(fallbackDir, { recursive: true });
            }
            cb(null, fallbackDir);
        }
    },
    filename: function (req, file, cb) {
        // Preservar extensión original
        const originalExt = path.extname(file.originalname);
        const clientId = req.body.id_cliente || (req.user ? req.user.id : "default");
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${clientId}_${uniqueSuffix}${originalExt}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Añadir .kmz a los tipos permitidos
    const allowedTypes = [".zip", ".rar", ".7z", ".tar", ".gz", ".tar.gz", ".kmz", ".kml"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        return cb(null, true);
    }
    cb(new Error("Solo se permiten archivos comprimidos: ZIP, RAR, 7Z, TAR.GZ, KMZ, KML"));
};

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter,
});

// Subida de archivos con mejor manejo de errores
router.post(
    "/upload",
    authMiddleware,
    (req, res, next) => {
        console.log("Body recibido:", req.body);
        upload.single("file")(req, res, (err) => {
            if (err) {
                console.error("Error en multer:", err);
                return res.status(400).json({
                    success: false,
                    message: err.message || "Error al procesar el archivo",
                });
            }
            next();
        });
    },
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No se envió ningún archivo",
                });
            }

            console.log("Archivo subido con éxito:", req.file);
            console.log("Usuario:", req.user);
            console.log("Body completo:", req.body);

            // Información del archivo subido con validación adicional
            const fileInfo = {
                nombre_original: req.file.originalname || "archivo_sin_nombre",
                nombre_archivo: req.file.filename || "archivo_sin_nombre",
                ruta_archivo: req.file.path || "",
                tipo_archivo: path.extname(req.file.originalname || "").toLowerCase(),
                tamano: req.file.size || 0,
                id_usuario: req.user?.id || 0,
                id_cliente: req.user?.rol === "cliente" ? req.user.id : req.body?.id_cliente || null,
                id_estacion: req.body?.id_estacion || null,
            };

            // Validación adicional antes de insertar en la BD
            if (!fileInfo.nombre_original || !fileInfo.nombre_archivo || !fileInfo.ruta_archivo) {
                return res.status(400).json({
                    success: false,
                    message: "Información del archivo incompleta",
                });
            }

            // Guardar en la base de datos con try-catch específico
            try {
                const [result] = await db.query(
                    `INSERT INTO archivos 
                    (nombre_original, nombre_archivo, ruta_archivo, tipo_archivo, tamano, id_usuario, id_cliente, id_estacion) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        fileInfo.nombre_original,
                        fileInfo.nombre_archivo,
                        fileInfo.ruta_archivo,
                        fileInfo.tipo_archivo,
                        fileInfo.tamano,
                        fileInfo.id_usuario,
                        fileInfo.id_cliente,
                        fileInfo.id_estacion,
                    ],
                );

                console.log("Archivo guardado en la base de datos con ID:", result.insertId);

                res.status(201).json({
                    success: true,
                    message: "Archivo subido correctamente",
                    fileId: result.insertId,
                });
            } catch (dbError) {
                console.error("Error específico de la base de datos:", dbError);
                res.status(500).json({
                    success: false,
                    message: "Error al guardar en la base de datos: " + (dbError.message || "Error desconocido"),
                });
            }
        } catch (error) {
            console.error("Error general en el controlador:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Error al subir el archivo",
            });
        }
    },
);

// Modificar el middleware de autenticación para que también acepte tokens en la consulta
const customAuthMiddleware = async (req, res, next) => {
    try {
        // Primero verificar si hay token en el header
        const authHeader = req.headers.authorization;

        // Si no hay header, verificar si hay token en query params (para descargas)
        if (!authHeader && req.query.token) {
            req.headers.authorization = `Bearer ${req.query.token}`;
        }

        // Continuar con el middleware normal de autenticación
        await authMiddleware(req, res, next);
    } catch (error) {
        return res.status(401).json({ message: "No autorizado" });
    }
};

// Completar la función de descarga de archivos
router.get("/download/:id", authMiddleware, async (req, res) => {
    try {
        const fileId = req.params.id;
        console.log(`Petición de descarga para archivo ID: ${fileId}`);

        // Obtener información del archivo desde la base de datos
        const [files] = await db.query("SELECT * FROM archivos WHERE id_archivo = ?", [fileId]);

        if (files.length === 0) {
            console.log(`Archivo ID ${fileId} no encontrado en la base de datos`);
            return res.status(404).json({
                success: false,
                message: "Archivo no encontrado",
            });
        }

        const file = files[0];
        console.log(`Archivo encontrado en BD: ${file.nombre_original}, ruta: ${file.ruta_archivo}`);

        // Verificar permisos (si el usuario puede acceder a este archivo)
        if (req.user.rol !== "administrador" && req.user.rol !== "empleado" && req.user.id !== file.id_cliente) {
            console.log(`Usuario ${req.user.id} (${req.user.rol}) no tiene permiso para el archivo de cliente ${file.id_cliente}`);
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para acceder a este archivo",
            });
        }

        // Intentar diferentes rutas para encontrar el archivo
        const possiblePaths = [
            file.ruta_archivo, // Ruta tal como está en la base de datos
            path.join(__dirname, "..", file.ruta_archivo), // Ruta relativa desde directorio de rutas
            path.join(__dirname, "..", "..", file.ruta_archivo), // Un nivel más arriba
            path.join(__dirname, "..", "uploads", path.basename(file.ruta_archivo)), // En carpeta uploads general
            path.join(__dirname, "..", "uploads", String(file.id_cliente), path.basename(file.ruta_archivo)), // En carpeta del cliente
        ];

        // Buscar el archivo en las posibles rutas
        let filePath = null;
        for (const possiblePath of possiblePaths) {
            try {
                if (fs.existsSync(possiblePath)) {
                    filePath = possiblePath;
                    console.log(`Archivo encontrado en ruta: ${filePath}`);
                    break;
                }
            } catch (err) {
                console.log(`Error al verificar ruta ${possiblePath}: ${err.message}`);
            }
        }

        // Si no se encuentra el archivo en ninguna ruta
        if (!filePath) {
            console.log("No se encontró el archivo físico en ninguna ruta posible");
            return res.status(404).json({
                success: false,
                message: "El archivo físico no se encuentra en el servidor",
            });
        }

        // Establecer cabeceras según el tipo de archivo
        const ext = path.extname(file.nombre_original).toLowerCase();

        if (ext === ".kmz") {
            res.setHeader("Content-Type", "application/vnd.google-earth.kmz");
        } else if (ext === ".kml") {
            res.setHeader("Content-Type", "application/vnd.google-earth.kml+xml");
        }

        // Enviar el archivo como descarga
        console.log(`Enviando archivo: ${filePath}`);
        return res.download(filePath, file.nombre_original);
    } catch (error) {
        console.error(`Error al descargar archivo:`, error);
        return res.status(500).json({
            success: false,
            message: "Error al descargar el archivo",
            error: error.message,
        });
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
