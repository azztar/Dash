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
import { PageContainer } from "@/components/PageContainer";
import { useTheme } from "@/hooks/use-theme";
import { ArrowLeft, MapPin, Wind, Calendar, FileText } from "lucide-react"; // Importar iconos

const AirePage = () => {
    const { theme } = useTheme(); // Agregar hook de tema
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

    // Condición de carga mejorada con soporte para dark mode
    if (loading.stations && currentStep === 1) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent"></div>
                <span className="ml-2 text-slate-900 dark:text-slate-200">Cargando estaciones...</span>
            </div>
        );
    }

    return (
        <PageContainer>
            {/* Encabezado mejorado con soporte para tema oscuro */}
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Calidad del Aire</h1>
                {currentStep > 1 && (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                        <ArrowLeft size={16} />
                        Volver
                    </button>
                )}
            </div>

            {/* Navegación mejorada con responsive */}
            <div className="mb-6">
                {/* Versión desktop de la navegación */}
                <nav
                    className="hidden rounded-lg bg-white p-2 shadow-sm dark:bg-slate-800 sm:flex"
                    aria-label="Navegación"
                >
                    <ol className="flex w-full items-center">
                        <li
                            className={`flex items-center ${currentStep >= 1 ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                        >
                            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                1
                            </span>
                            <span className="text-sm font-medium">Estación</span>
                        </li>
                        <li className="mx-2 h-0.5 w-6 bg-slate-200 dark:bg-slate-700"></li>
                        <li
                            className={`flex items-center ${currentStep >= 2 ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                        >
                            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                2
                            </span>
                            <span className="text-sm font-medium">Parámetro</span>
                        </li>
                        <li className="mx-2 h-0.5 w-6 bg-slate-200 dark:bg-slate-700"></li>
                        <li
                            className={`flex items-center ${currentStep >= 3 ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                        >
                            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                3
                            </span>
                            <span className="text-sm font-medium">Fecha</span>
                        </li>
                        <li className="mx-2 h-0.5 w-6 bg-slate-200 dark:bg-slate-700"></li>
                        <li
                            className={`flex items-center ${currentStep >= 4 ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`}
                        >
                            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                4
                            </span>
                            <span className="text-sm font-medium">Resultados</span>
                        </li>
                    </ol>
                </nav>

                {/* Versión móvil de la navegación */}
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm dark:bg-slate-800 sm:hidden">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Paso {currentStep} de 4</span>
                    <div className="flex space-x-1">
                        {[1, 2, 3, 4].map((step) => (
                            <div
                                key={step}
                                className={`h-1.5 rounded-full ${
                                    step === currentStep
                                        ? "w-6 bg-blue-500"
                                        : step < currentStep
                                          ? "w-3 bg-blue-300 dark:bg-blue-700"
                                          : "w-3 bg-slate-200 dark:bg-slate-700"
                                }`}
                            ></div>
                        ))}
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {currentStep === 1 ? "Estación" : currentStep === 2 ? "Parámetro" : currentStep === 3 ? "Fecha" : "Resultados"}
                    </span>
                </div>
            </div>

            {/* Panel de selección de estación mejorado */}
            {currentStep === 1 && (
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800 sm:p-6">
                    <h2 className="mb-4 flex items-center text-lg font-semibold text-slate-900 dark:text-white sm:text-xl">
                        <MapPin className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
                        Seleccione una estación
                    </h2>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {stations.map((station) => (
                            <div
                                key={station.id_estacion}
                                onClick={() => handleStationSelect(station)}
                                className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 sm:p-4"
                            >
                                <div className="flex items-center">
                                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 sm:h-10 sm:w-10">
                                        <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-slate-900 transition-colors dark:text-slate-100">
                                            {station.nombre_estacion}
                                        </h3>
                                        <div className="mt-0.5 text-xs text-slate-500 transition-colors dark:text-slate-400 sm:text-sm">
                                            {station.parametros_disponibles ? (
                                                <span className="flex flex-wrap gap-1.5">
                                                    {Array.isArray(station.parametros_disponibles)
                                                        ? station.parametros_disponibles.map((param, idx) => (
                                                              <span
                                                                  key={idx}
                                                                  className="rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                              >
                                                                  {param}
                                                              </span>
                                                          ))
                                                        : station.parametros_disponibles.split(/,\s*/).map((param, idx) => (
                                                              <span
                                                                  key={idx}
                                                                  className="rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                                              >
                                                                  {param.trim()}
                                                              </span>
                                                          ))}
                                                </span>
                                            ) : (
                                                "Sin parámetros configurados"
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-2 h-1 w-full scale-x-0 rounded-full bg-blue-500 transition-transform group-hover:scale-x-100"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Panel de selección de parámetro mejorado */}
            {currentStep === 2 && selectedStation && (
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 flex items-center text-xl font-semibold text-slate-900 dark:text-white">
                        <Wind className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
                        Seleccione un parámetro
                    </h2>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            Estación seleccionada: {selectedStation.nombre_estacion}
                        </p>
                    </div>
                    <div className="mt-4">
                        <ParameterSelector
                            selectedStation={selectedStation}
                            selectedNorm={selectedNorm}
                            onSelect={handleNormSelect}
                        />
                    </div>
                </div>
            )}

            {/* Panel de selección de fecha mejorado */}
            {currentStep === 3 && selectedStation && selectedNorm && (
                <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
                    <h2 className="mb-4 flex items-center text-xl font-semibold text-slate-900 dark:text-white">
                        <Calendar className="mr-2 h-5 w-5 text-blue-500 dark:text-blue-400" />
                        Fechas disponibles para {selectedStation.nombre_estacion} - {selectedNorm}
                    </h2>
                    <AirQualityDateSelector
                        key={`${selectedStation.id_estacion}-${selectedNorm}`}
                        selectedDate={selectedDate}
                        onSelect={handleDateSelect}
                        availableDates={availableDates}
                        loading={loading.dates}
                        error={error}
                    />
                    {selectedDate && (
                        <div className="mt-4 rounded-lg bg-blue-50 p-4 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            <p className="text-sm">Fecha seleccionada: {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}</p>
                            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{format(selectedDate, "yyyy-MM-dd")}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Panel de resultados mejorado */}
            {currentStep === 4 && (
                <div className="space-y-6">
                    {loading.measurements ? (
                        <div className="flex h-40 items-center justify-center rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent dark:border-blue-400 dark:border-t-transparent"></div>
                            <span className="ml-2 text-slate-700 dark:text-slate-300">Cargando mediciones...</span>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900/20 dark:bg-red-900/10 dark:text-red-400">
                            <h3 className="mb-2 font-medium">Error al cargar datos</h3>
                            <p>{error.message || "Se produjo un error al procesar la solicitud"}</p>
                        </div>
                    ) : !data?.data?.length ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-800">
                            <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600" />
                            <h3 className="mt-4 text-xl font-medium text-slate-900 dark:text-white">Sin mediciones</h3>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">No hay datos disponibles para la fecha seleccionada</p>
                            <button
                                onClick={() => setCurrentStep(3)}
                                className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                Seleccionar otra fecha
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
                                <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                                    <h3 className="font-medium text-slate-900 dark:text-white">
                                        Mediciones para {selectedStation?.nombre_estacion} - {selectedNorm}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {selectedDate && format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
                                    </p>
                                </div>
                                <MeasurementsTable
                                    data={data}
                                    stationName={selectedStation?.nombre_estacion}
                                    parameterName={selectedNorm}
                                />
                            </div>

                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
                                <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                                    <h3 className="font-medium text-slate-900 dark:text-white">Gráfico de mediciones</h3>
                                </div>
                                <div className="p-4">
                                    <AirQualityChart
                                        data={data}
                                        parameterName={selectedNorm}
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-slate-800">
                                <div className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                                    <h3 className="font-medium text-slate-900 dark:text-white">Análisis de conformidad</h3>
                                </div>
                                <div className="p-4">
                                    <ConformityTable
                                        data={data}
                                        date={selectedDate}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </PageContainer>
    );
};

export default AirePage;
