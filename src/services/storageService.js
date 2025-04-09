// src/services/storageService.js
import { supabase } from "@/lib/supabase";
import { testStorageService } from "./testStorageService";

// Variable para controlar si estamos en modo de prueba
const TEST_MODE = true; // Cambiar a false para usar Supabase en producción

/**
 * Servicio unificado para almacenamiento de archivos
 * Intenta usar Supabase primero, y si falla, usa simulación local
 */
export const storageService = {
    /**
     * Sube un archivo usando Supabase Storage o la alternativa de prueba
     * @param {File} file El archivo a subir
     * @param {Object} metadata Metadatos del archivo (clienteId, estacionId, etc)
     * @returns {Promise<Object>} Resultado de la subida
     */
    async uploadFile(file, metadata) {
        // Si estamos en modo de prueba, usar el servicio de prueba
        if (TEST_MODE) {
            console.log("Modo de prueba activado, usando almacenamiento local");
            return testStorageService.uploadFile(file, metadata);
        }

        try {
            console.log("Intentando usar Supabase Storage");

            // Intentar crear el bucket 'archivos' (más simple que 'files')
            const bucketName = "archivos";

            try {
                // Crear bucket (ignorar error si ya existe)
                const { data: bucketData, error: bucketError } = await supabase.storage.createBucket(bucketName, {
                    public: false,
                });

                if (!bucketError) {
                    console.log(`Bucket '${bucketName}' creado exitosamente`);
                } else if (bucketError.code === "23505") {
                    // Error de duplicado significa que ya existe (esto es bueno)
                    console.log(`Bucket '${bucketName}' ya existe, continuando...`);
                } else {
                    console.warn(`Nota sobre el bucket:`, bucketError);
                }
            } catch (bucketCreateError) {
                console.log("Error al crear bucket, puede ser normal si ya existe:", bucketCreateError);
            }

            // Ahora intentar subir el archivo al bucket
            const fileName = `${metadata.clienteId}/${Date.now()}_${Math.random().toString(36).substring(2)}${getFileExtension(file.name)}`;

            console.log(`Subiendo archivo a Supabase en bucket '${bucketName}'`);
            const { data, error } = await supabase.storage.from(bucketName).upload(fileName, file);

            if (error) {
                console.error("Error subiendo archivo a Supabase:", error);
                // En caso de error, caer al modo de prueba como fallback
                console.log("Usando modo de prueba como fallback");
                return testStorageService.uploadFile(file, metadata);
            }

            console.log("Archivo subido exitosamente a Supabase:", data);
            return {
                success: true,
                provider: "supabase",
                data,
                filePath: fileName,
                fileUrl: `${bucketName}/${fileName}`,
            };
        } catch (error) {
            console.error("Error en Supabase Storage:", error);
            // En caso de cualquier error, intentar con el modo de prueba
            console.log("Usando modo de prueba como fallback después de error");
            return testStorageService.uploadFile(file, metadata);
        }
    },
};

/**
 * Obtiene la extensión de un archivo
 */
function getFileExtension(filename) {
    return `.${filename.split(".").pop().toLowerCase()}`;
}
