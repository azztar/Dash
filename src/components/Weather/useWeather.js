import { useState, useEffect } from "react";
import axios from "axios";

// Nueva API key proporcionada por el usuario
const API_KEY = "19e8c39629534e4773205b56494fe828";

export const useWeather = () => {
    const [weather, setWeather] = useState(null);
    const [forecast, setForecast] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRealData, setIsRealData] = useState(true); // Indicador de datos reales

    useEffect(() => {
        const fetchWeatherData = async (latitude, longitude) => {
            try {
                // Usar la nueva API key
                const weatherResponse = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${API_KEY}`,
                );

                setWeather(weatherResponse.data);
                setIsRealData(true); // Marca como datos reales

                // También intentemos obtener el pronóstico real con la nueva API key
                try {
                    const forecastResponse = await axios.get(
                        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=es&appid=${API_KEY}`,
                    );

                    // Procesar datos de pronóstico (5 días, cada 3 horas)
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
                    console.log("Usando pronóstico simulado (el endpoint forecast falló)");
                    // Si falla, usar el pronóstico simulado como respaldo
                    const mockForecast = Array(8)
                        .fill(null)
                        .map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() + i);
                            const tempBase = weatherResponse.data.main.temp;
                            return {
                                dt: date.getTime() / 1000,
                                temp: {
                                    max: tempBase + Math.random() * 5,
                                    min: tempBase - Math.random() * 5,
                                },
                                weather: [
                                    {
                                        icon: weatherResponse.data.weather[0].icon,
                                        description: weatherResponse.data.weather[0].description,
                                    },
                                ],
                            };
                        });
                    setForecast(mockForecast);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error al obtener datos del clima:", err);

                // Usar datos placeholder como respaldo
                const fallbackWeather = {
                    name: "Tu ubicación",
                    weather: [
                        {
                            description: "información del clima no disponible",
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
                setIsRealData(false); // Marca como datos de respaldo
                setError("No se pudieron cargar los datos del clima. Mostrando información aproximada.");
                setLoading(false);
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchWeatherData(latitude, longitude);
                },
                (err) => {
                    console.error("Error de geolocalización:", err);
                    fetchWeatherData(4.6097, -74.0817);
                    setError("No se pudo obtener tu ubicación. Mostrando clima de Bogotá.");
                },
            );
        } else {
            console.error("Geolocalización no soportada por este navegador");
            fetchWeatherData(4.6097, -74.0817);
            setError("Tu navegador no soporta geolocalización. Mostrando clima de Bogotá.");
        }
    }, []);

    return { weather, forecast, loading, error, isRealData };
};
