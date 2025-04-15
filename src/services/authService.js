// src/services/authService.js
import apiClient from "./apiService";

export const authService = {
    async login(nit, password) {
        try {
            const response = await apiClient.post("/auth/login", { nit, password });
            if (response.data.token) {
                localStorage.setItem("token", response.data.token);
            }
            return response.data;
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    },

    async logout() {
        localStorage.removeItem("token");
        return { success: true };
    },

    async getProfile() {
        try {
            const response = await apiClient.get("/auth/profile");
            return response.data;
        } catch (error) {
            console.error("Error obteniendo perfil:", error);
            throw error;
        }
    },
};

// Separar el dataService
export const dataService = {
    async getEstaciones() {
        try {
            const response = await apiClient.get("/stations");
            return response.data;
        } catch (error) {
            console.error("Error obteniendo estaciones:", error);
            throw error;
        }
    },

    async getMedicionesAire(estacionId, parametroId) {
        try {
            const response = await apiClient.get("/measurements/air", {
                params: { estacionId, parametroId },
            });
            return response.data;
        } catch (error) {
            console.error("Error obteniendo mediciones:", error);
            throw error;
        }
    },
};
