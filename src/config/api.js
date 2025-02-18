export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
    measurements: "/api/measurements",
    dates: "/api/measurements/dates",
    stations: "/api/stations",
    parameters: "/api/parameters",
};
