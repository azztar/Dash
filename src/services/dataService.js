// src/services/dataService.js
import apiClient from "./apiService";

export const dataService = {
    async getEstaciones() {
        const response = await apiClient.get("/stations");
        return response.data;
    },

    async getMedicionesAire(estacionId, parameterId) {
        const response = await apiClient.get(`/measurements/air`, {
            params: {
                estacionId,
                parameterId,
            },
        });
        return response.data;
    },
};
