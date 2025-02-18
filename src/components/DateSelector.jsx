import React, { useEffect, useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@tremor/react";

export const DateSelector = ({ selectedDate, onSelect, availableDates = [], loading = false, error = null }) => {
    // Validar y formatear fechas
    const validDates = useMemo(() => {
        console.log("📅 Procesando fechas recibidas:", availableDates);

        if (!Array.isArray(availableDates)) {
            console.warn("⚠️ availableDates no es un array:", availableDates);
            return [];
        }

        return availableDates
            .map((date) => {
                try {
                    // Si ya es un objeto Date, usarlo directamente
                    if (date instanceof Date) {
                        return {
                            original: format(date, "yyyy-MM-dd"),
                            parsed: date,
                            formatted: format(date, "d 'de' MMMM yyyy", { locale: es }),
                        };
                    }

                    // Si es un string, parsearlo
                    if (typeof date === "string") {
                        const parsed = parseISO(date);
                        if (!isValid(parsed)) {
                            console.warn("⚠️ Fecha string inválida:", date);
                            return null;
                        }
                        return {
                            original: date,
                            parsed,
                            formatted: format(parsed, "d 'de' MMMM yyyy", { locale: es }),
                        };
                    }

                    // Si es un objeto con propiedad fecha
                    if (date?.fecha) {
                        const parsed = date.fecha instanceof Date ? date.fecha : parseISO(date.fecha);

                        if (!isValid(parsed)) {
                            console.warn("⚠️ Fecha objeto inválida:", date.fecha);
                            return null;
                        }
                        return {
                            original: format(parsed, "yyyy-MM-dd"),
                            parsed,
                            formatted: format(parsed, "d 'de' MMMM yyyy", { locale: es }),
                        };
                    }

                    console.warn("⚠️ Formato de fecha no soportado:", date);
                    return null;
                } catch (error) {
                    console.error("❌ Error procesando fecha:", date, error);
                    return null;
                }
            })
            .filter(Boolean);
    }, [availableDates]);

    // Actualizar la selección automática
    useEffect(() => {
        if (validDates.length > 0 && !selectedDate) {
            const primeraFecha = validDates[0].original; // Usar original que ya está en formato YYYY-MM-DD
            console.log("🎯 Selección automática:", primeraFecha);
            handleDateSelect(primeraFecha);
        }
    }, [validDates, selectedDate]);

    // Actualizar handleDateSelect para manejar fechas consistentemente
    const handleDateSelect = (date) => {
        if (!date) {
            console.warn("⚠️ Intento de seleccionar fecha nula");
            return;
        }

        try {
            // Si la fecha ya es un string en formato correcto, úsala directamente
            const formattedDate = typeof date === "string" ? date : format(date, "yyyy-MM-dd");

            console.log("✅ Seleccionando fecha corregida:", {
                input: date,
                processed: formattedDate,
            });

            onSelect(formattedDate); // Enviar fecha como string al backend
        } catch (error) {
            console.error("❌ Error al seleccionar fecha:", error);
        }
    };

    const handleClick = (date) => {
        // Asegurar que la fecha esté en formato YYYY-MM-DD
        const formattedDate = typeof date === "string" ? date : format(new Date(date), "yyyy-MM-dd");

        console.log("✅ Seleccionando fecha corregida:", {
            input: date,
            processed: formattedDate,
        });

        onSelect(formattedDate);
    };

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
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sm underline hover:text-red-600"
                    >
                        Reintentar
                    </button>
                </div>
            </Card>
        );
    }

    if (!validDates.length) {
        return (
            <Card>
                <div className="p-4 text-center text-gray-500">
                    <p>No hay fechas disponibles para los parámetros seleccionados</p>
                    <p className="mt-2 text-sm">Por favor, seleccione otra estación o parámetro</p>
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
                        onClick={() => handleClick(date)}
                        className={`rounded-lg p-2 text-sm transition-colors ${
                            selectedDate === date ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 hover:bg-gray-200"
                        }`}
                    >
                        {format(new Date(date), "d 'de' MMMM yyyy", { locale: es })}
                    </button>
                ))}
            </div>
        </Card>
    );
};
