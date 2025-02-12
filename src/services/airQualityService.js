import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

class AirQualityService {
    async getStations() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/estaciones`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener estaciones:", error);
            throw error;
        }
    }

    async getMediciones(stationId) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/mediciones/${stationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener mediciones:", error);
            throw error;
        }
    }

    // Obtener mediciones por estación, parámetro y fecha
    async getMeasurementsByDate(stationId, parameter, date) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/mediciones-aire`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    id_estacion: stationId,
                    parametro: parameter,
                    fecha: date, // Usar la fecha formateada
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener mediciones por fecha:", error);
            throw error;
        }
    }

    // Obtener mediciones por estación
    async getMeasurements(stationId, normType, startDate, endDate) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/mediciones-aire`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    id_estacion: stationId,
                    tipo_norma: normType,
                    fecha_inicio: startDate.toISOString(),
                    fecha_fin: endDate.toISOString(),
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener mediciones:", error);
            throw error;
        }
    }

    // Obtener normas aplicables
    async getNorms() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/normas`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener normas:", error);
            throw error;
        }
    }

    // Obtener declaraciones de conformidad
    async getConformityDeclarations(measurementId) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/declaraciones-conformidad/${measurementId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener declaraciones:", error);
            throw error;
        }
    }

    async getAvailableDates(stationId, parameter) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/fechas-disponibles/${stationId}/${parameter}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener fechas disponibles:", error);
            throw error;
        }
    }

    async getMedicionesDisponibles(stationId) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/mediciones-disponibles/${stationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener mediciones disponibles:", error);
            throw error;
        }
    }

    async getMedicionDetalle(medicionId) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/medicion/${medicionId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener detalle de medición:", error);
            throw error;
        }
    }
}

export const airQualityService = new AirQualityService();
