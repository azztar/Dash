import React from "react";
import { Card } from "@tremor/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const AirQualityDateSelector = ({ selectedDate, onSelect, availableDates = [], loading = false, error = null }) => {
    // Solo para debug
    console.log("Estado AirQualityDateSelector:", {
        fechasDisponibles: availableDates,
        fechaSeleccionada: selectedDate,
        cargando: loading,
        error,
    });

    if (loading) {
        return (
            <Card>
                <div className="flex items-center justify-center p-4">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="ml-2">Cargando fechas disponibles...</span>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="p-4 text-center text-red-500">
                    <p>{error}</p>
                </div>
            </Card>
        );
    }

    if (!availableDates?.length) {
        return (
            <Card>
                <div className="p-4 text-center text-gray-500">
                    <p>No hay fechas disponibles</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="grid gap-2 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {availableDates.map((date) => (
                    <button
                        key={date}
                        onClick={() => onSelect(date)}
                        className={`rounded-lg p-2 text-sm transition-colors ${
                            selectedDate === date
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                        }`}
                    >
                        {format(new Date(date), "d 'de' MMMM yyyy", { locale: es })}
                    </button>
                ))}
            </div>
        </Card>
    );
};
