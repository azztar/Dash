const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Crear carpeta por usuario y estación
        const uploadDir = path.join(
            __dirname,
            "../uploads",
            req.user.nit, // Carpeta por NIT de usuario
            `estacion_${req.body.stationId}`, // Subcarpeta por estación
        );

        fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${req.user.nit}_${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [".zip", ".rar", ".7z"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Solo se permiten archivos ZIP, RAR y 7Z"));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

module.exports = upload;
