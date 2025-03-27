import React, { useState, useEffect } from "react";
import { useWeather } from "./useWeather";
import { WeatherForecast } from "./WeatherForecast";
import weatherIcons from "./weatherIcons";
import { Compass, CloudRain, ArrowDown, ArrowUp, Droplets, Wind, RefreshCw, Loader2 } from "lucide-react";

export const WeatherCard = () => {
    const { weather, forecast, loading, error, isRealData } = useWeather();
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [refreshing, setRefreshing] = useState(false);

    // Función para actualizar manualmente los datos del clima
    const handleRefresh = () => {
        setRefreshing(true);
        // Forzar recarga de la página después de un tiempo
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    };

    // Actualizar timestamp
    useEffect(() => {
        if (weather && !loading) {
            setLastUpdated(new Date());
        }
    }, [weather, loading]);

    if (loading) {
        return (
            <div className="col-span-1 flex h-[220px] items-center justify-center rounded-lg border bg-white p-6 text-center shadow-md dark:border-slate-700 dark:bg-slate-800 md:col-span-2 lg:col-span-3">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Cargando datos del clima...</p>
                </div>
            </div>
        );
    }

    if (error && !weather) {
        return (
            <div className="col-span-1 rounded-lg border border-red-200 bg-white p-6 text-center shadow-md dark:border-red-800 dark:bg-slate-800 md:col-span-2 lg:col-span-3">
                <div className="flex flex-col items-center">
                    <div className="mb-2 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        <CloudRain className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Error al cargar datos del clima</h3>
                    <p className="mt-2 text-slate-600 dark:text-slate-300">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="mt-4 flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                    >
                        <RefreshCw size={16} />
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    if (!weather) return null;

    const weatherIcon = weatherIcons[weather.weather[0].icon] || "☁️";

    return (
        <div className="col-span-1 overflow-hidden rounded-lg border bg-white shadow-md dark:border-slate-700 dark:bg-slate-800 md:col-span-2 lg:col-span-3">
            {/* Barra de estado */}
            <div className="flex items-center justify-between border-b px-4 py-2 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <Compass className="h-4 w-4 text-blue-500" />
                    <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">Clima en {weather.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isRealData ? (
                        <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span>
                            Datos en vivo
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                            <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                            Datos aproximados
                        </span>
                    )}
                    <button
                        onClick={handleRefresh}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                        disabled={refreshing}
                    >
                        {refreshing ? (
                            <Loader2
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <RefreshCw size={16} />
                        )}
                    </button>
                </div>
            </div>

            {/* Contenido principal */}
            <div className="p-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Clima actual */}
                    <div className="flex items-center justify-center md:justify-start">
                        <div className="mr-6 text-7xl">{weatherIcon}</div>
                        <div>
                            <div className="text-4xl font-bold text-slate-900 dark:text-white">{Math.round(weather.main.temp)}°C</div>
                            <div className="mt-1 text-lg capitalize text-slate-600 dark:text-slate-300">{weather.weather[0].description}</div>
                            <div className="mt-2 flex items-center gap-3">
                                <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                    <ArrowDown className="h-3 w-3" />
                                    {forecast && forecast[0] ? Math.round(forecast[0].temp.min) : Math.round(weather.main.temp - 3)}°C
                                </span>
                                <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                    <ArrowUp className="h-3 w-3" />
                                    {forecast && forecast[0] ? Math.round(forecast[0].temp.max) : Math.round(weather.main.temp + 3)}°C
                                </span>
                                <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="text-xs">ST</span>
                                    {Math.round(weather.main.feels_like)}°C
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detalles adicionales */}
                    <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-700/30 md:mt-0">
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Droplets className="h-4 w-4" />
                                Humedad
                            </div>
                            <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{weather.main.humidity}%</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Wind className="h-4 w-4" />
                                Viento
                            </div>
                            <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                                {Math.round(weather.wind.speed * 3.6)} km/h
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pronóstico */}
                <div className="mt-4">
                    <WeatherForecast forecast={forecast && forecast.slice(1, 6)} />
                </div>
            </div>

            {/* Pie de la tarjeta */}
            <div className="border-t px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                <div className="flex justify-between">
                    <span>Fuente: OpenWeatherMap</span>
                    <span>Actualizado: {lastUpdated.toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );
};
