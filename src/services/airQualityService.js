import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const airQualityService = {
    async getStations() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/estaciones`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener estaciones:", error);
            throw error;
        }
    },

    async getAvailableDates(estacionId, parametro) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/fechas-disponibles/${estacionId}/${parametro}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data.map((date) => new Date(date));
        } catch (error) {
            console.error("Error al obtener fechas disponibles:", error);
            throw error;
        }
    },

    async getMeasurementsByDate(estacionId, parametro, fecha) {
        try {
            const token = localStorage.getItem("token");
            // Formatear la fecha a YYYY-MM-DD
            const formattedDate = fecha.toISOString().split("T")[0];

            const response = await axios.get(`${API_URL}/api/mediciones/${estacionId}/${parametro}/${formattedDate}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data.data;
        } catch (error) {
            console.error("Error al obtener mediciones:", error);
            throw error;
        }
    },
};
