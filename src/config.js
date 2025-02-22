export const API_URL = "http://localhost:5000";

export const config = {
    api: {
        baseUrl: API_URL,
        endpoints: {
            measurements: `${API_URL}/api/measurements`,
            stations: `${API_URL}/api/stations`,
            availableDates: `${API_URL}/api/measurements/available-dates`,
        },
    },
};

export default config;
