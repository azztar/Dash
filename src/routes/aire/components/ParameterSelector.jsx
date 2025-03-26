import React, { useEffect, useState } from "react";
import { Card } from "@tremor/react";
import { useAuth } from "@/contexts/AuthContext";

export const ParameterSelector = ({ selectedStation, selectedNorm, onSelect }) => {
    const { token } = useAuth();
    const [parametrosDisponibles, setParametrosDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParametros = async () => {
            if (!selectedStation?.id_estacion) return;

            setLoading(true);
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/measurements/parameters/${selectedStation.id_estacion}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (data.success) {
                    setParametrosDisponibles(data.parameters);
                }
            } catch (error) {
                console.error("Error al cargar parámetros:", error);
                setError("Error al cargar los parámetros");
            } finally {
                setLoading(false);
            }
        };

        fetchParametros();
    }, [selectedStation, token]);

    // Debug log mejorado
    console.log("Estado ParameterSelector:", {
        estacionId: selectedStation?.id_estacion,
        parametrosDisponibles,
        loading,
        error,
    });

    if (!selectedStation) {
        return (
            <div className="rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">Seleccione primero una estación</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="rounded-lg border border-gray-200 p-6 text-center">
                <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-500">Cargando parámetros...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (parametrosDisponibles.length === 0) {
        return (
            <div className="rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No hay parámetros configurados para {selectedStation.nombre_estacion}</p>
            </div>
        );
    }

    // Añadir soporte para tema oscuro
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {parametrosDisponibles.map((param) => (
                <div
                    key={param}
                    onClick={() => onSelect(param)}
                    className={`cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
                        selectedNorm === param
                            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/30"
                            : "border-slate-200 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/20"
                    }`}
                >
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">{param}</h3>
                </div>
            ))}
        </div>
    );
};
