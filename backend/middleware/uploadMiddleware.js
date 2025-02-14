const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.includes("excel") || file.mimetype.includes("spreadsheetml")) {
            cb(null, true);
        } else {
            cb(new Error("Solo se permiten archivos Excel"));
        }
    },
});

module.exports = upload;
