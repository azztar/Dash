import { useState, useEffect } from "react";
import { Card } from "@tremor/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { useAirQuality } from "./hooks/useAirQuality";
import { StationSelector } from "./components/StationSelector";
import { ParameterSelector } from "./components/ParameterSelector";
import { AirQualityDateSelector } from "@/components/AirQualityDateSelector";
import { MeasurementsTable } from "./components/MeasurementsTable";
import { AirQualityChart } from "./components/AirQualityChart";
import { ConformityTable } from "./components/ConformityTable";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { EmptyState } from "@/components/EmptyState";

const AirePage = () => {
    const {
        stations,
        selectedStation,
        setSelectedStation,
        selectedNorm,
        setSelectedNorm,
        selectedDate,
        setSelectedDate,
        availableDates,
        data,
        loading,
        error,
        currentStep,
        setCurrentStep,
    } = useAirQuality();

    // Efecto para debug mejorado
    useEffect(() => {
        console.log("Estado actual:", {
            currentStep,
            estacion: selectedStation?.nombre_estacion,
            parametro: selectedNorm,
            fecha: selectedDate ? formatInTimeZone(selectedDate, "America/Bogota", "d 'de' MMMM yyyy", { locale: es }) : null,
            fechasDisponibles: availableDates?.length || 0,
            loading,
            error,
        });
    }, [currentStep, selectedStation, selectedNorm, selectedDate, availableDates, loading, error]);

    // Efecto para monitorear cambios en selectedDate
    useEffect(() => {
        if (selectedDate) {
            console.log("AirePage - Fecha seleccionada actualizada:", {
                fecha: format(selectedDate, "yyyy-MM-dd"),
                paso: currentStep,
            });
        }
    }, [selectedDate, currentStep]);

    // Manejador de estación mejorado
    const handleStationSelect = (station) => {
        console.log("Seleccionando estación:", station.nombre_estacion);
        setSelectedStation(station);
        setSelectedNorm(null); // Resetear parámetro al cambiar de estación
        setSelectedDate(null); // Resetear fecha al cambiar de estación
        setCurrentStep(2);
    };

    // Manejador de parámetro mejorado
    const handleNormSelect = (norm) => {
        console.log("Seleccionando parámetro:", norm);
        setSelectedNorm(norm);
        setSelectedDate(null); // Resetear fecha al cambiar de parámetro
        setCurrentStep(3);
    };

    // Manejador de fecha mejorado
    const handleDateSelect = (date) => {
        console.log("🎯 handleDateSelect iniciado:", {
            fecha: date,
            tipo: date instanceof Date ? "Date" : typeof date,
        });

        if (!date) {
            setSelectedDate(null);
            return;
        }

        try {
            const dateObject = date instanceof Date ? date : new Date(date);

            if (isNaN(dateObject.getTime())) {
                console.error("❌ Fecha inválida:", {
                    fechaOriginal: date,
                    intentoParse: dateObject,
                });
                return;
            }

            const formattedDate = format(dateObject, "yyyy-MM-dd");
            console.log("✅ Fecha válida seleccionada:", formattedDate);

            setSelectedDate(dateObject);
            setCurrentStep(4);
        } catch (error) {
            console.error("❌ Error procesando fecha:", error);
        }
    };

    // Manejador para volver atrás
    const handleBack = () => {
        const newStep = currentStep - 1;
        setCurrentStep(newStep);

        // Limpiar estados según el paso
        if (newStep < 4) setSelectedDate(null);
        if (newStep < 3) setSelectedNorm(null);
        if (newStep < 2) setSelectedStation(null);
    };

    // Condición de carga
    if (loading.stations && currentStep === 1) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <span className="ml-2">Cargando estaciones...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen space-y-6 p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Calidad del Aire</h1>
                {currentStep > 1 && (
                    <button
                        onClick={handleBack}
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
                    >
                        Volver
                    </button>
                )}
            </div>

            {/* Componente de navegación */}
            <div className="mb-6">
                <nav
                    className="flex"
                    aria-label="Navegación"
                >
                    <ol className="flex items-center space-x-2">
                        <li className={`text-sm ${currentStep >= 1 ? "text-blue-600" : "text-gray-500"}`}>Estación</li>
                        <li className="text-gray-500">/</li>
                        <li className={`text-sm ${currentStep >= 2 ? "text-blue-600" : "text-gray-500"}`}>Parámetro</li>
                        <li className="text-gray-500">/</li>
                        <li className={`text-sm ${currentStep >= 3 ? "text-blue-600" : "text-gray-500"}`}>Fecha</li>
                        <li className="text-gray-500">/</li>
                        <li className={`text-sm ${currentStep >= 4 ? "text-blue-600" : "text-gray-500"}`}>Resultados</li>
                    </ol>
                </nav>
            </div>

            {currentStep === 1 && (
                <Card>
                    <h2 className="mb-4 text-xl font-semibold">Seleccione una estación</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {stations.map((station) => (
                            <div
                                key={station.id_estacion}
                                onClick={() => handleStationSelect(station)}
                                className="cursor-pointer rounded-lg border p-4 hover:border-blue-500 hover:bg-blue-50"
                            >
                                <h3 className="font-medium">{station.nombre_estacion}</h3>
                                <p className="text-sm text-gray-500">{station.parametros_disponibles || "Sin parámetros configurados"}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {currentStep === 2 && selectedStation && (
                <Card>
                    <h2 className="mb-4 text-xl font-semibold">Seleccione un parámetro</h2>
                    <ParameterSelector
                        selectedStation={selectedStation}
                        selectedNorm={selectedNorm}
                        onSelect={handleNormSelect}
                    />
                </Card>
            )}

            {currentStep === 3 && selectedStation && selectedNorm && (
                <Card>
                    <h2 className="mb-4 text-xl font-semibold">
                        Fechas disponibles para {selectedStation.nombre_estacion} - {selectedNorm}
                    </h2>
                    <AirQualityDateSelector
                        key={`${selectedStation.id_estacion}-${selectedNorm}`} // Forzar remontaje al cambiar selección
                        selectedDate={selectedDate}
                        onSelect={handleDateSelect}
                        availableDates={availableDates}
                        loading={loading.dates}
                        error={error}
                    />
                    {selectedDate && (
                        <div className="mt-4 rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">Fecha seleccionada: {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}</p>
                            <p className="mt-1 text-xs text-blue-600">{format(selectedDate, "yyyy-MM-dd")}</p>
                        </div>
                    )}
                </Card>
            )}

            {currentStep === 4 && (
                <div className="space-y-6">
                    {loading.measurements ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorMessage error={error} />
                    ) : !data?.data?.length ? (
                        <EmptyState
                            title="Sin mediciones"
                            message="No hay datos disponibles para la fecha seleccionada"
                            suggestion="Por favor, seleccione otra fecha"
                            onBack={() => setCurrentStep(3)}
                        />
                    ) : (
                        <>
                            <MeasurementsTable
                                data={data}
                                stationName={selectedStation?.nombre_estacion}
                                parameterName={selectedNorm}
                            />
                            <AirQualityChart
                                data={data}
                                parameterName={selectedNorm}
                            />
                            <ConformityTable
                                data={data}
                                date={selectedDate}
                            />
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default AirePage;
