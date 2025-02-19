import axios from "axios";
import { API_BASE_URL } from "../config/constants";

export const measurementService = {
    async getAvailableDates(stationId, parameterId) {
        try {
            console.log("🔍 Solicitando fechas:", { stationId, parameterId });

            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/api/measurements/dates`, {
                params: { stationId, parameterId },
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("📅 Respuesta del servidor:", response.data);
            return response.data.dates;
        } catch (error) {
            console.error("❌ Error al obtener fechas:", error);
            return [];
        }
    },
};
