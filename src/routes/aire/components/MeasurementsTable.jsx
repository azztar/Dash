import React from "react";
import { Card } from "@tremor/react";
import { LoadingState } from "./LoadingState";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

// Asegurar que la tabla respete el tema oscuro
export const MeasurementsTable = ({ data, stationName, parameterName }) => {
    // Debug de datos
    console.log("MeasurementsTable - Datos recibidos:", {
        tieneData: !!data,
        contienePropiedadData: data && "data" in data,
        longitudDatos: data?.data?.length || 0,
        primerElemento: data?.data?.[0] || null,
    });

    // Validación de datos
    if (!data?.data || data.data.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">No hay mediciones disponibles</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="bg-slate-50 text-left text-sm text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                        <th className="whitespace-nowrap p-3 font-medium">Muestra</th>
                        <th className="whitespace-nowrap p-3 font-medium">Fecha</th>
                        <th className="whitespace-nowrap p-3 font-medium">Hora</th>
                        <th className="whitespace-nowrap p-3 font-medium">Concentración</th>
                        <th className="whitespace-nowrap p-3 font-medium">Unidad</th>
                        <th className="whitespace-nowrap p-3 font-medium">Estado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {data.data.map((item, index) => {
                        // SOLUCIÓN: Usar directamente fecha_muestra sin intentar manipularla
                        // La estructura del backend ya devuelve fecha_muestra en formato DD/MM/YYYY
                        const isAboveLimit = parseFloat(item.concentracion.replace(",", ".")) > parseFloat(item.valor_limite || 0);

                        return (
                            <tr
                                key={index}
                                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            >
                                <td className="p-3 text-slate-900 dark:text-slate-200">{item.muestra}</td>
                                <td className="p-3 text-slate-900 dark:text-slate-200">{item.fecha_muestra}</td>
                                <td className="p-3 text-slate-900 dark:text-slate-200">{item.hora_muestra}</td>
                                <td className="p-3 text-slate-900 dark:text-slate-200">{item.concentracion}</td>
                                <td className="p-3 text-slate-900 dark:text-slate-200">{item.unidad || "µg/m³"}</td>
                                <td className="p-3">
                                    <span
                                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                                            isAboveLimit
                                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                        }`}
                                    >
                                        {isAboveLimit ? "Excede límite" : "Conforme"}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};
