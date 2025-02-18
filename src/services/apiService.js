// src/services/apiService.js
import { API_URL, API_ENDPOINTS } from "@/config/api";

class ApiService {
    constructor() {
        // En desarrollo, usamos la URL relativa si hay proxy configurado
        this.baseUrl = process.env.NODE_ENV === "development" ? "" : API_URL;
    }

    async fetchWithAuth(endpoint, options = {}) {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                ...options,
                credentials: "include",
                headers: {
                    ...options.headers,
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error("Error en la petición:", error);
            throw error;
        }
    }

    async getMeasurements(stationId, parameterId, date) {
        const params = new URLSearchParams({
            stationId,
            parameterId,
            date: date.toISOString(),
        });

        return this.fetchWithAuth(`${API_ENDPOINTS.measurements}?${params}`);
    }
}

export const apiService = new ApiService();
