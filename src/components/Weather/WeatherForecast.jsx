import React from "react";
import weatherIcons from "./weatherIcons";

export const WeatherForecast = ({ forecast }) => {
    if (!forecast || forecast.length === 0) {
        return null;
    }

    const getDayName = (date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        // Opciones de formato corto de día
        const options = { weekday: "short" };

        if (date.toDateString() === today.toDateString()) {
            return "Hoy";
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return "Mañana";
        } else {
            return date.toLocaleDateString("es-ES", options);
        }
    };

    return (
        <div className="overflow-x-auto">
            {/* Aumentar el ancho mínimo para acomodar 6 días */}
            <div className="flex min-w-[600px] gap-1">
                {forecast.map((day, index) => {
                    const date = new Date(day.dt * 1000);
                    const weatherIcon = weatherIcons[day.weather[0].icon] || "☁️";

                    return (
                        <div
                            key={index}
                            className="flex flex-1 flex-col items-center rounded-lg bg-slate-50 p-2 text-center transition-colors hover:bg-slate-100 dark:bg-slate-700/30 dark:hover:bg-slate-700/50"
                        >
                            <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{getDayName(date)}</div>
                            {/* Reducir el tamaño de los iconos para que quepan 6 días */}
                            <div className="my-2">{React.createElement(weatherIcon, { size: 32, className: "text-blue-500 mx-auto" })}</div>
                            <div className="flex gap-2 text-sm">
                                <span className="font-semibold text-slate-900 dark:text-white">{Math.round(day.temp.max)}°</span>
                                <span className="text-slate-500 dark:text-slate-400">{Math.round(day.temp.min)}°</span>
                            </div>
                            <div className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">{day.weather[0].description}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
