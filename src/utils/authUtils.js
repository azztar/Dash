import axios from "axios";

// Función para obtener el token JWT desde la URL
export const getTokenFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get("token");
};

// Función para guardar el token en localStorage
export const saveTokenToLocalStorage = (token) => {
    if (token) {
        localStorage.setItem("token", token);
    }
};

// Función para obtener el token desde localStorage
export const getTokenFromLocalStorage = () => {
    return localStorage.getItem("token");
};

// Función para obtener datos del usuario autenticado
export const fetchUserData = async (token) => {
    try {
        const response = await axios.get("http://localhost:5000/api/protected", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data.user;
    } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        return null;
    }
};

// Función para obtener datos del dashboard
export const fetchDashboardData = async (token) => {
    try {
        const response = await axios.get("http://localhost:5000/api/dashboard", {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
        return null;
    }
};
