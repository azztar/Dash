// backend/controllers/fileController.js
const multer = require("multer");
const path = require("path");
const File = require("../models/File");

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

exports.uploadFile = [
    upload.single("file"),
    async (req, res) => {
        try {
            const { userId } = req.user; // Obtenido del middleware de autenticación
            const { originalname, path: filePath } = req.file;

            // Guardar en la base de datos
            const file = await File.create({
                fileName: originalname,
                filePath,
                uploadedBy: userId,
            });

            res.json({ success: true, message: "Archivo subido correctamente.", file });
        } catch (error) {
            console.error("Error al subir el archivo:", error);
            res.status(500).json({ success: false, message: "Error al subir el archivo." });
        }
    },
];

exports.downloadFile = async (req, res) => {
    const { fileId } = req.params;

    try {
        const file = await File.findByPk(fileId); // Buscar por ID
        if (!file) {
            return res.status(404).json({ success: false, message: "Archivo no encontrado." });
        }

        res.download(file.filePath, file.fileName);
    } catch (error) {
        console.error("Error al descargar el archivo:", error);
        res.status(500).json({ success: false, message: "Error al descargar el archivo." });
    }
};
