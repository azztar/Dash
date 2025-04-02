const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkFiles() {
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "icc",
    });

    try {
        console.log("Verificando archivos en la base de datos...");
        const [rows] = await connection.execute("SELECT id_archivo, nombre_original, ruta_archivo, tipo_archivo FROM archivos");

        console.log(`Encontrados ${rows.length} archivos en la base de datos`);

        // Rutas base a verificar
        const baseDir = __dirname;
        const projectRoot = path.join(baseDir, "..");

        for (const file of rows) {
            console.log(`\nVerificando archivo #${file.id_archivo}: ${file.nombre_original}`);
            const possiblePaths = [
                file.ruta_archivo,
                path.join(projectRoot, file.ruta_archivo),
                path.join(projectRoot, "..", file.ruta_archivo),
                path.join(projectRoot, "uploads", path.basename(file.ruta_archivo)),
            ];

            let found = false;
            for (const possiblePath of possiblePaths) {
                try {
                    if (fs.existsSync(possiblePath)) {
                        console.log(`✅ Archivo encontrado en: ${possiblePath}`);
                        found = true;
                        break;
                    }
                } catch (err) {
                    console.log(`Error al verificar ruta ${possiblePath}: ${err.message}`);
                }
            }

            if (!found) {
                console.log(`❌ No se encontró el archivo: ${file.nombre_original}`);

                // Verificar si existe la carpeta de uploads
                const uploadsDir = path.join(projectRoot, "uploads");
                if (!fs.existsSync(uploadsDir)) {
                    console.log(`⚠️ La carpeta uploads no existe: ${uploadsDir}`);
                } else {
                    console.log(`✓ La carpeta uploads existe: ${uploadsDir}`);

                    // Listar archivos en la carpeta uploads para buscar coincidencias
                    console.log("Buscando archivos similares...");

                    function searchFiles(dir, baseName) {
                        try {
                            const files = fs.readdirSync(dir);
                            for (const fileName of files) {
                                const filePath = path.join(dir, fileName);
                                const stats = fs.statSync(filePath);

                                if (stats.isDirectory()) {
                                    searchFiles(filePath, baseName);
                                } else if (
                                    fileName.includes(baseName) ||
                                    fileName === path.basename(file.ruta_archivo) ||
                                    path.extname(fileName) === file.tipo_archivo
                                ) {
                                    console.log(`🔍 Posible coincidencia: ${filePath}`);
                                }
                            }
                        } catch (err) {
                            console.log(`Error al buscar en ${dir}: ${err.message}`);
                        }
                    }

                    searchFiles(uploadsDir, path.basename(file.nombre_original, path.extname(file.nombre_original)));
                }
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
        console.log("\nVerificación completada");
    }
}

checkFiles();
