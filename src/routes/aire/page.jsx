import React, { useState } from "react";
import { useAirQuality } from "./hooks/useAirQuality";
import { StationSelector } from "./components/StationSelector";
import { ParameterSelector } from "./components/ParameterSelector";
import { DateSelector } from "./components/DateSelector";
import { MeasurementsTable } from "./components/MeasurementsTable";
import { AirQualityChart } from "./components/AirQualityChart";
import { ConformityTable } from "./components/ConformityTable";
import { Card } from "@tremor/react";

const AirePage = () => {
    const { stations, selectedStation, setSelectedStation, selectedNorm, setSelectedNorm, selectedDate, setSelectedDate, data, loading, error } =
        useAirQuality();

    // Paso actual del flujo (1: estaciones, 2: parámetros, 3: fechas, 4: datos)
    const [currentStep, setCurrentStep] = useState(1);

    const handleStationSelect = (station) => {
        setSelectedStation(station);
        setCurrentStep(2); // Avanzar al selector de parámetros
    };

    const handleNormSelect = (norm) => {
        setSelectedNorm(norm);
        setCurrentStep(3); // Avanzar al selector de fechas
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setCurrentStep(4); // Avanzar a la visualización de datos
    };

    return (
        <div className="min-h-screen space-y-6 p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Calidad del Aire</h1>
                {currentStep > 1 && (
                    <button
                        onClick={() => setCurrentStep(currentStep - 1)}
                        className="rounded-md bg-gray-200 px-4 py-2 text-sm hover:bg-gray-300"
                    >
                        Volver
                    </button>
                )}
            </div>

            {/* Paso 1: Selección de Estación */}
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
                                <p className="text-sm text-gray-500">{station.ubicacion}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Paso 2: Selección de Parámetro */}
            {currentStep === 2 && (
                <Card>
                    <h2 className="mb-4 text-xl font-semibold">Seleccione un parámetro</h2>
                    <ParameterSelector
                        selectedNorm={selectedNorm}
                        onSelect={handleNormSelect}
                    />
                </Card>
            )}

            {/* Paso 3: Selección de Fecha */}
            {currentStep === 3 && (
                <Card>
                    <h2 className="mb-4 text-xl font-semibold">Seleccione fecha de medición</h2>
                    <DateSelector
                        selectedDate={selectedDate}
                        onSelect={handleDateSelect}
                    />
                </Card>
            )}

            {/* Paso 4: Visualización de Datos */}
            {currentStep === 4 && data && (
                <div className="space-y-6">
                    <MeasurementsTable data={data} />
                    <AirQualityChart data={data} />
                    <ConformityTable data={data} />
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            )}

            {error && <div className="rounded-md bg-red-50 p-4 text-red-500">{error}</div>}
        </div>
    );
};

export default AirePage;
