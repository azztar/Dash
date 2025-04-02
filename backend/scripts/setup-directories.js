const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function setupDirectories() {
    // Conectar a la base de datos para obtener los IDs de clientes
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "icc",
    });

    try {
        // Crear el directorio principal de uploads si no existe
        const projectRoot = path.join(__dirname, "..");
        const uploadsDir = path.join(projectRoot, "uploads");

        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir);
            console.log(`✅ Directorio creado: ${uploadsDir}`);
        } else {
            console.log(`✓ El directorio ya existe: ${uploadsDir}`);
        }

        // Crear directorio default
        const defaultDir = path.join(uploadsDir, "default");
        if (!fs.existsSync(defaultDir)) {
            fs.mkdirSync(defaultDir);
            console.log(`✅ Directorio creado: ${defaultDir}`);
        } else {
            console.log(`✓ El directorio ya existe: ${defaultDir}`);
        }

        // Obtener todos los clientes
        const [clients] = await connection.execute("SELECT DISTINCT id_cliente FROM archivos WHERE id_cliente IS NOT NULL");

        // Crear directorios para cada cliente
        for (const client of clients) {
            const clientDir = path.join(uploadsDir, String(client.id_cliente));
            if (!fs.existsSync(clientDir)) {
                fs.mkdirSync(clientDir);
                console.log(`✅ Directorio para cliente ${client.id_cliente} creado: ${clientDir}`);
            } else {
                console.log(`✓ El directorio para cliente ${client.id_cliente} ya existe: ${clientDir}`);
            }
        }

        console.log("\n📁 Estructura de directorios preparada correctamente");
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

setupDirectories();
