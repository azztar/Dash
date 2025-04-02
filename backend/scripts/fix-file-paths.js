const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config();

// Crear conexión a la base de datos
const createConnection = async () => {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
};

const fixFilePaths = async () => {
    const db = await createConnection();
    console.log("Conectado a la base de datos");

    try {
        // 1. Obtener todos los archivos de la base de datos
        const [files] = await db.query("SELECT * FROM archivos");
        console.log(`Encontrados ${files.length} archivos en la base de datos`);

        // 2. Verificar y corregir rutas
        let updatedCount = 0;

        for (const file of files) {
            const originalPath = file.ruta_archivo;
            const fileName = path.basename(originalPath);

            // Ruta relativa correcta que deberíamos usar
            const correctRelativePath = `uploads/${file.id_cliente || "default"}/${fileName}`;
            const correctAbsolutePath = path.join(__dirname, "..", correctRelativePath);

            console.log(`Procesando: ${file.id_archivo} - ${file.nombre_original}`);
            console.log(`  Ruta actual: ${originalPath}`);
            console.log(`  Ruta deseada: ${correctAbsolutePath}`);

            // Verificar si el archivo existe en la ruta original
            let fileExists = false;
            try {
                fileExists = fs.existsSync(originalPath);
            } catch (error) {
                console.log(`  Error al verificar la ruta original: ${error.message}`);
            }

            if (fileExists) {
                console.log(`  ✅ Archivo encontrado en ruta original`);

                // Actualizar la ruta a una relativa
                await db.query("UPDATE archivos SET ruta_archivo = ? WHERE id_archivo = ?", [correctRelativePath, file.id_archivo]);
                updatedCount++;
                console.log(`  ✅ Ruta actualizada a formato relativo`);
            } else {
                // Buscar el archivo por nombre en toda la carpeta uploads
                const uploadsDir = path.join(__dirname, "..", "uploads");
                let foundPath = null;

                const findFile = (directory) => {
                    if (foundPath) return;

                    try {
                        const items = fs.readdirSync(directory);

                        for (const item of items) {
                            const fullPath = path.join(directory, item);

                            if (fs.statSync(fullPath).isDirectory()) {
                                findFile(fullPath);
                            } else if (item === fileName) {
                                foundPath = fullPath;
                                return;
                            }
                        }
                    } catch (err) {
                        console.log(`  Error al buscar en directorio ${directory}: ${err.message}`);
                    }
                };

                findFile(uploadsDir);

                if (foundPath) {
                    console.log(`  ✅ Archivo encontrado en: ${foundPath}`);
                    const relativeFoundPath = path.relative(path.join(__dirname, ".."), foundPath).replace(/\\/g, "/");

                    // Actualizar la ruta en la base de datos
                    await db.query("UPDATE archivos SET ruta_archivo = ? WHERE id_archivo = ?", [relativeFoundPath, file.id_archivo]);
                    updatedCount++;
                    console.log(`  ✅ Ruta actualizada a: ${relativeFoundPath}`);
                } else {
                    console.log(`  ❌ Archivo no encontrado`);
                }
            }
        }

        console.log(`Proceso completo. Se actualizaron ${updatedCount} de ${files.length} rutas.`);
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await db.end();
        console.log("Conexión cerrada");
    }
};

fixFilePaths().catch(console.error);
