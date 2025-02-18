import React from "react";
import { Card } from "@tremor/react";

export const ParameterSelector = ({ selectedStation, selectedNorm, onSelect }) => {
    const getParametros = (estacionId) => {
        const parametrosPorEstacion = {
            1: [{ id: "SO2", name: "SO2", descripcion: "Dióxido de Azufre" }],
            10: [{ id: "PM2.5", name: "PM2.5", descripcion: "Material Particulado 2.5" }],
            7: [],
            8: [],
        };

        return parametrosPorEstacion[estacionId] || [];
    };

    console.log("Estado ParameterSelector:", {
        estacionId: selectedStation?.id_estacion,
        parametrosDisponibles: selectedStation ? getParametros(selectedStation.id_estacion) : [],
    });

    if (!selectedStation) {
        return (
            <div className="rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">Seleccione primero una estación</p>
            </div>
        );
    }

    const parametrosDisponibles = getParametros(selectedStation.id_estacion);

    if (parametrosDisponibles.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No hay parámetros configurados para {selectedStation.nombre_estacion}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {parametrosDisponibles.map((param) => (
                <Card
                    key={param.id}
                    onClick={() => onSelect(param.id)}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedNorm === param.id ? "border-2 border-blue-500 bg-blue-50" : "hover:border-gray-300"
                    }`}
                >
                    <div className="space-y-2 p-4">
                        <h3 className="text-lg font-semibold">{param.name}</h3>
                        <p className="text-sm text-gray-500">{param.descripcion}</p>
                    </div>
                </Card>
            ))}
        </div>
    );
};
