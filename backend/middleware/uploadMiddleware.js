const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configurar almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Crear la estructura de carpetas si no existe
        const uploadDir = path.join(__dirname, "../uploads/default");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre de archivo único para evitar colisiones
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        // Mantener la extensión original del archivo
        const fileExt = path.extname(file.originalname);
        cb(null, `default_${uniqueSuffix}${fileExt}`);
    },
});

// Verificar la configuración del fileFilter
const fileFilter = (req, file, cb) => {
    // Lista de extensiones permitidas
    const allowedTypes = [".zip", ".rar", ".7z", ".kmz", ".kml"];

    // Obtener extensión del archivo original
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        // Archivo permitido
        cb(null, true);
    } else {
        // Rechazar archivo
        cb(new Error(`Solo se permiten archivos: ${allowedTypes.join(", ")}`));
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // Límite de 25MB
    },
});

module.exports = upload;
