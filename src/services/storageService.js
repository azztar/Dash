// src/services/storageService.js
import { API_BASE_URL } from "../config/constants";
import axios from "axios";

/**
 * Servicio para gestionar el almacenamiento de archivos
 * Utiliza la API del backend para almacenar archivos
 */
export const storageService = {
    /**
     * Sube un archivo utilizando la API
     * @param {File} file - Archivo a subir
     * @param {Object} options - Opciones adicionales (clienteId, estacionId, etc.)
     * @returns {Promise<Object>} - Resultado de la operación
     */
    async uploadFile(file, options = {}) {
        try {
            return await this.uploadToAPI(file, options);
        } catch (error) {
            console.error("Error al subir archivo:", error);
            throw error;
        }
    },

    /**
     * Sube un archivo utilizando la API existente
     * @private
     */
    async uploadToAPI(file, options) {
        try {
            const formData = new FormData();
            formData.append("file", file);

            // Añadir metadatos adicionales
            if (options.clienteId) formData.append("id_cliente", options.clienteId);
            if (options.estacionId) formData.append("id_estacion", options.estacionId);
            if (options.descripcion) formData.append("descripcion", options.descripcion);

            const response = await axios.post(`${API_BASE_URL}/api/files/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            return {
                success: true,
                provider: "api",
                fileId: response.data.fileId,
                message: response.data.message,
            };
        } catch (error) {
            console.error("Error al subir a la API:", error);
            throw error;
        }
    },

    /**
     * Registra la información del archivo en la base de datos
     * @private
     */
    async registerFileInDatabase(fileData) {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/files/register`, fileData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al registrar archivo en la base de datos:", error);
            // No lanzamos error para que no falle la operación principal
        }
    },

    /**
     * Obtiene la URL de descarga de un archivo
     */
    async getFileUrl(fileData) {
        // Si ya tenemos una URL, la devolvemos directamente
        if (fileData.url_descarga) return fileData.url_descarga;

        // Si es de la API, construimos la URL de descarga
        if (fileData.id_archivo) {
            return `${API_BASE_URL}/api/files/download/${fileData.id_archivo}?token=${localStorage.getItem("token")}`;
        }

        throw new Error("No se pudo determinar la URL del archivo");
    },

    /**
     * Elimina un archivo
     */
    async deleteFile(fileData) {
        try {
            // Si tenemos ID en la base de datos, eliminamos el registro
            if (fileData.id_archivo) {
                await axios.delete(`${API_BASE_URL}/api/files/${fileData.id_archivo}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
            }

            return { success: true };
        } catch (error) {
            console.error("Error al eliminar archivo:", error);
            throw error;
        }
    },
};

export default storageService;
