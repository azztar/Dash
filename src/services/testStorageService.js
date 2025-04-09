// src/services/testStorageService.js
import { supabase } from "@/lib/supabase";
import { randomBytes } from "crypto";

// Importar configuración SQLite (usando un import dinámico)
let sqliteDB = null;

// Inicializar la base de datos SQLite (solo en modo de prueba)
const initSQLite = async () => {
    try {
        // Solo importar en entorno de desarrollo para evitar problemas en producción
        if (import.meta.env.DEV) {
            const sqliteConfig = await import("../config/sqlite-config.js");
            sqliteDB = sqliteConfig.default || sqliteConfig;
            await sqliteDB.initTestDB();
            console.log("Base de datos SQLite lista para pruebas");
            return true;
        }
        return false;
    } catch (error) {
        console.error("Error inicializando SQLite:", error);
        return false;
    }
};

/**
 * Servicio para pruebas que almacena archivos localmente
 * y registra los metadatos en SQLite
 */
export const testStorageService = {
    /**
     * Sube un archivo usando almacenamiento local y SQLite
     * @param {File} file El archivo a subir
     * @param {Object} metadata Metadatos del archivo
     * @returns {Promise<Object>} Resultado de la subida
     */
    async uploadFile(file, metadata) {
        try {
            console.log("Usando servicio de almacenamiento local para pruebas");

            // Inicializar SQLite si no está inicializado
            if (!sqliteDB) {
                await initSQLite();
            }

            // Generar un nombre único para el archivo
            const fileId = Date.now().toString(36) + randomBytes(4).toString("hex");
            const fileExt = this.getFileExtension(file.name);
            const fileName = `${metadata.clienteId}/${fileId}${fileExt}`;

            // Simular almacenamiento (en un entorno real, aquí guardarías el archivo)
            console.log(`Simulando almacenamiento de archivo: ${fileName}`);

            // Registrar en la base de datos SQLite
            if (sqliteDB) {
                try {
                    await sqliteDB.query(
                        `INSERT INTO archivos 
             (nombre_original, nombre_archivo, ruta_archivo, tipo_archivo, tamano, id_usuario, id_cliente, id_estacion) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [
                            file.name,
                            fileName,
                            `uploads/${fileName}`,
                            fileExt,
                            file.size,
                            1, // Usuario de prueba
                            metadata.clienteId,
                            metadata.estacionId,
                        ],
                    );
                    console.log("✅ Registro guardado en SQLite");
                } catch (dbError) {
                    console.error("Error guardando en SQLite:", dbError);
                }
            }

            // También intentar con Supabase como respaldo
            let supabaseResult = null;
            try {
                // Intentar subir a Supabase si está disponible
                const { data, error } = await supabase.storage.from("archivos").upload(fileName, file);

                if (!error) {
                    supabaseResult = { success: true, provider: "supabase", filePath: fileName };
                    console.log("✅ Archivo también subido a Supabase");
                }
            } catch (supabaseError) {
                console.log("ℹ️ Supabase no disponible:", supabaseError.message);
            }

            // Devolver resultado
            return {
                success: true,
                provider: supabaseResult ? "hybrid" : "local-sqlite",
                filePath: fileName,
                fileUrl: `test://${fileName}`,
                data: {
                    id: fileId,
                    name: file.name,
                    path: fileName,
                    size: file.size,
                    type: file.type,
                },
            };
        } catch (error) {
            console.error("Error en servicio de almacenamiento de prueba:", error);
            return {
                success: false,
                provider: "error",
                error: error.message,
            };
        }
    },

    /**
     * Obtiene la extensión de un archivo
     */
    getFileExtension(filename) {
        return `.${filename.split(".").pop().toLowerCase()}`;
    },
};
