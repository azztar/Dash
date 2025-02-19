import axios from "axios";

const API_URL = "http://localhost:5000"; // URL fija para desarrollo

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
};
