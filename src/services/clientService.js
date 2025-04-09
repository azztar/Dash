import axios from "axios";
import { storageService } from "./storageService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const clientService = {
    async getClients() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/clients`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener clientes:", error);
            throw error;
        }
    },

    async getClientStations(clientId) {
        try {
            console.log("🔍 Solicitando estaciones para cliente:", clientId);

            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/clients/${clientId}/stations`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("✅ Estaciones obtenidas:", response.data);
            return response.data.data || [];
        } catch (error) {
            console.error("❌ Error al obtener estaciones:", error);
            return [];
        }
    },

    async uploadMeasurements(data) {
        const token = localStorage.getItem("token");
        const response = await axios.post(`${API_URL}/api/measurements`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    },

    /**
     * Sube un archivo y registra la información en el backend
     * @param {File} file - Archivo para subir
     * @param {Object} metadata - Metadatos del archivo (clienteId, estacionId, etc.)
     * @returns {Promise<Object>} - Respuesta con la información del archivo
     */
    async uploadFile(file, metadata = {}) {
        try {
            const token = localStorage.getItem("token");

            // Subir el archivo directamente a través de la API
            const storageResult = await storageService.uploadFile(file, metadata);

            if (!storageResult.success) {
                throw new Error("Error al subir el archivo al almacenamiento");
            }

            // No es necesario registrar el archivo separadamente ya que el API
            // ya lo hace en el proceso de subida

            return {
                success: true,
                fileId: storageResult.fileId,
                message: storageResult.message,
                storageInfo: storageResult,
            };
        } catch (error) {
            console.error("Error en uploadFile:", error);
            throw error;
        }
    },

    /**
     * Obtiene la lista de archivos del usuario o cliente específico
     * @param {string} clientId - ID del cliente (opcional)
     * @returns {Promise<Array>} - Lista de archivos
     */
    async getFiles(clientId = null) {
        try {
            const token = localStorage.getItem("token");
            let url = `${API_URL}/api/files/list`;

            if (clientId) {
                url += `?clientId=${clientId}`;
            }

            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.files || [];
        } catch (error) {
            console.error("Error al obtener lista de archivos:", error);
            throw error;
        }
    },

    /**
     * Obtiene la URL de descarga de un archivo
     * @param {number} fileId - ID del archivo
     * @returns {Promise<string>} - URL de descarga
     */
    async getFileDownloadUrl(fileId) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/files/${fileId}/url`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return response.data.downloadUrl;
        } catch (error) {
            console.error("Error al obtener URL de descarga:", error);
            throw error;
        }
    },
};
