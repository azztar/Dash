import axios from "axios";

// Configuración para cPanel
const API_URL = import.meta.env.MODE === "development" ? import.meta.env.VITE_API_URL : "/api"; // En producción, las APIs estarán en /api

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para añadir token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default apiClient;
