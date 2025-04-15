import axios from "axios";
import { API_BASE_URL } from "../config/constants";
import apiClient from "./apiService";

export const measurementService = {
    async getAvailableDates(stationId, parameterId) {
        try {
            console.log("🔍 Solicitando fechas:", { stationId, parameterId });

            const response = await apiClient.get("/measurements/dates", {
                params: { stationId, parameterId },
            });

            console.log("📅 Respuesta del servidor:", response.data);
            return response.data.dates;
        } catch (error) {
            console.error("❌ Error al obtener fechas:", error);
            return [];
        }
    },

    async getStations() {
        try {
            const response = await apiClient.get("/stations");
            return response.data;
        } catch (error) {
            console.error("Error obteniendo estaciones:", error);
            throw error;
        }
    },

    async uploadMeasurements(formData) {
        try {
            const response = await apiClient.post("/measurements/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error subiendo mediciones:", error);
            throw error;
        }
    },
};
