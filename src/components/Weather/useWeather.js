import { useState, useEffect } from "react";
import axios from "axios";

// Usar variable de entorno en lugar de hardcodear la clave
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY || "";

export const useWeather = () => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRealData, setIsRealData] = useState(false); // Cambiado a false por defecto

    useEffect(() => {
        const fetchWeatherData = async (latitude, longitude) => {
            try {
                // DESACTIVADO TEMPORALMENTE: Llamadas a la API de OpenWeather
                // Descomentar estas líneas cuando quieras volver a activar la API
                /*
                const weatherResponse = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${API_KEY}`,
                );
                setWeather(weatherResponse.data);
                setIsRealData(true);
                */

                // USAR DATOS SIMULADOS SIEMPRE
                console.log("Usando datos simulados de clima (API desactivada)");

                // Datos simulados para clima actual
                const fallbackWeather = {
                    name: "Tu ubicación",
                    weather: [
                        {
                            description: "información del clima simulada",
                            icon: "03d",
                        },
                    ],
                    main: {
                        temp: 22,
                        feels_like: 23,
                        humidity: 60,
                        pressure: 1013,
                    },
                    wind: { speed: 2.1 },
                };

                setWeather(fallbackWeather);
                setIsRealData(false);

                // DESACTIVADO TEMPORALMENTE: Pronóstico
                /*
                try {
                    const forecastResponse = await axios.get(
                        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${API_KEY}`,
                    );
                    
                    // Procesar datos de pronóstico...
                    const processedForecast = forecastResponse.data.list
                        .filter((_, index) => index % 8 === 0)
                        .slice(0, 8)
                        .map((day) => ({
                            dt: day.dt,
                            temp: {
                                max: day.main.temp_max,
                                min: day.main.temp_min,
                            },
                            weather: [day.weather[0]],
                        }));

                    setForecast(processedForecast);
                } catch (forecastErr) {
                    console.log("Usando pronóstico simulado");
                    // Pronóstico simulado...
                }
                */

                // Usar siempre pronóstico simulado
                const mockForecast = Array(8)
                    .fill(null)
                    .map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() + i);
                        return {
                            dt: date.getTime() / 1000,
                            temp: {
                                max: 25 + Math.random() * 5,
                                min: 18 - Math.random() * 5,
                            },
                            weather: [
                                {
                                    icon: "03d",
                                    description: "parcialmente nublado",
                                },
                            ],
                        };
                    });
                setForecast(mockForecast);

                setLoading(false);
            } catch (err) {
                console.log("Usando respaldo para todos los datos del clima");
                // El código de respaldo existente ya maneja esto...
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            // Usar coordenadas de Bogotá directamente en lugar de solicitar geolocalización
            fetchWeatherData(4.6097, -74.0817);
        } else {
            fetchWeatherData(4.6097, -74.0817);
        }
    }, []);

    return { weather, forecast, loading, error, isRealData };
};
