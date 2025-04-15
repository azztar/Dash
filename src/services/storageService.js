// src/services/storageService.js
import { API_BASE_URL } from "../config/constants";
import axios from "axios";
import apiClient from "./apiService";

// Servicio de almacenamiento único que decide qué proveedor usar
export const storageService = {
    /**
     * Sube un archivo al servidor
     * @param {File} file - El archivo a subir
     * @param {Object} metadata - Metadatos adicionales (clienteId, estacionId, etc.)
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async uploadFile(file, metadata = {}) {
        try {
            // Crear FormData para el envío
            const formData = new FormData();
            formData.append("file", file);

            // Añadir metadatos si existen
            Object.keys(metadata).forEach((key) => {
                formData.append(key, metadata[key]);
            });

            // Subir al servidor
            const response = await apiClient.post("/files/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            return {
                success: response.data.success,
                provider: "server",
                filePath: response.data.filePath,
                fileUrl: response.data.fileUrl,
                data: response.data,
            };
        } catch (error) {
            console.error("Error en storageService.uploadFile:", error);
            return {
                success: false,
                provider: "server",
                error: error.message,
            };
        }
    },
};

export default storageService;
