// src/services/storageService.js
import { supabase } from "@/lib/supabase";
import axios from "axios";
import { API_BASE_URL } from "@/config/constants";

/**
 * Servicio unificado para almacenamiento de archivos
 * Intenta usar Supabase primero, y si falla, usa el backend
 */
export const storageService = {
    /**
     * Sube un archivo usando Supabase Storage o el backend como fallback
     * @param {File} file El archivo a subir
     * @param {Object} metadata Metadatos del archivo (clienteId, estacionId, etc)
     * @returns {Promise<Object>} Resultado de la subida
     */
    async uploadFile(file, metadata) {
        try {
            // Intentar primero con Supabase
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucketExists = buckets?.find((b) => b.name === "files");

            // Si el bucket existe en Supabase, usar Supabase Storage
            if (bucketExists) {
                console.log("Usando Supabase Storage para subir archivo");

                const fileName = `${metadata.clienteId}/${Date.now()}_${Math.random().toString(36).substring(2)}${getFileExtension(file.name)}`;

                const { data, error } = await supabase.storage.from("files").upload(fileName, file);

                if (error) throw error;

                return {
                    success: true,
                    provider: "supabase",
                    data,
                    filePath: fileName,
                };
            } else {
                // Si no existe el bucket, usar el backend como fallback
                console.log("Bucket no encontrado en Supabase, usando backend como fallback");
                return await uploadToBackend(file, metadata);
            }
        } catch (error) {
            console.error("Error en Supabase Storage:", error);
            console.log("Intentando subir al backend como fallback");

            // Intentar con el backend como fallback
            return await uploadToBackend(file, metadata);
        }
    },
};

/**
 * Sube un archivo al backend usando FormData
 * @param {File} file El archivo a subir
 * @param {Object} metadata Metadatos del archivo
 * @returns {Promise<Object>} Resultado de la subida
 */
async function uploadToBackend(file, metadata) {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("id_cliente", metadata.clienteId);
        formData.append("id_estacion", metadata.estacionId);

        const token = localStorage.getItem("token");

        const response = await axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        });

        return {
            success: true,
            provider: "backend",
            data: response.data,
            filePath: response.data.filePath || response.data.fileInfo?.ruta_archivo,
        };
    } catch (error) {
        console.error("Error al subir al backend:", error);
        throw new Error("No se pudo subir el archivo a ningún proveedor de almacenamiento");
    }
}

/**
 * Obtiene la extensión de un archivo
 */
function getFileExtension(filename) {
    return `.${filename.split(".").pop().toLowerCase()}`;
}
