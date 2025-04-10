// Servicio para manejar operaciones de base de datos
import apiClient from "./apiService";

export const databaseService = {
    // Estaciones
    getStationsByClient: async (clientId) => {
        try {
            const response = await apiClient.get(`/api/stations?clientId=${clientId}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo estaciones:", error);
            throw error;
        }
    },

    // Mediciones
    uploadMeasurement: async (formData) => {
        try {
            const response = await apiClient.post("/api/measurements/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error subiendo medición:", error);
            throw error;
        }
    },

    // Declaraciones
    uploadDeclaration: async (formData) => {
        try {
            const response = await apiClient.post("/api/declarations/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error subiendo declaración:", error);
            throw error;
        }
    },
};
