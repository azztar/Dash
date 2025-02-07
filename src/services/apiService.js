// src/services/apiService.js
import axios from "axios";

const apiClient = axios.create({
    baseURL: "http://localhost:5000/api", // URL del backend
    headers: { "Content-Type": "application/json" },
});

export default apiClient;
