import { supabase } from "@/lib/supabase";

export const supabaseStorage = {
    /**
     * Sube un archivo a Supabase Storage
     * @param {File} file - El archivo a subir
     * @param {Object} metadata - Metadatos adicionales (clienteId, estacionId, etc.)
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async uploadFile(file, metadata = {}) {
        try {
            // Bucket de archivos (debe existir en la consola de Supabase)
            const BUCKET_NAME = "files";

            // Crear nombre de archivo único
            const fileName = `${metadata.clienteId || "general"}/${Date.now()}-${file.name}`;

            // Subir archivo a Supabase
            const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

            if (error) {
                console.error("Error al subir archivo a Supabase:", error);
                throw error;
            }

            // Obtener URL pública del archivo
            const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

            return {
                success: true,
                provider: "supabase",
                filePath: fileName,
                fileUrl: urlData?.publicUrl,
                data,
            };
        } catch (error) {
            console.error("Error en supabaseStorage.uploadFile:", error);
            return {
                success: false,
                provider: "supabase",
                error: error.message,
            };
        }
    },
};
