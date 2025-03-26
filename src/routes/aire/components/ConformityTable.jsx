import React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const ConformityTable = ({ data, date }) => {
    // AÑADIR ESTE CÓDIGO DE DIAGNÓSTICO
    console.log("ConformityTable - Datos recibidos:", {
        data,
        hasConformity: data && "conformity" in data,
        hasMetadata: data && "metadata" in data,
    });

    // 🛠 ADAPTADOR - No modifica el comportamiento existente, sólo mejora la búsqueda
    // Busca la declaración de conformidad en diferentes estructuras posibles
    const conformityData =
        data?.conformity || // Estructura principal esperada
        data?.metadata?.declaracionConformidad || // Estructura alternativa
        data?.data?.find((m) => m.id_declaracion) || // Busca en las mediciones
        null;

    // Resto de tu código existente...
    if (!conformityData) {
        return (
            <div className="flex h-40 flex-col items-center justify-center space-y-2 p-4 text-center">
                <div className="rounded-full bg-blue-100 p-3 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle
                            cx="12"
                            cy="12"
                            r="10"
                        ></circle>
                        <line
                            x1="12"
                            y1="8"
                            x2="12"
                            y2="12"
                        ></line>
                        <line
                            x1="12"
                            y1="16"
                            x2="12.01"
                            y2="16"
                        ></line>
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">Sin análisis de conformidad</h3>
                <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
                    No se encontró un análisis de conformidad para las mediciones seleccionadas.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 text-left text-sm text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                            <th className="whitespace-nowrap p-3 font-medium">Parámetro</th>
                            <th className="whitespace-nowrap p-3 font-medium">Límite Normativo</th>
                            <th className="whitespace-nowrap p-3 font-medium">Media de Concentración</th>
                            <th className="whitespace-nowrap p-3 font-medium">Probabilidad de Conformidad</th>
                            <th className="whitespace-nowrap p-3 font-medium">Declaración</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        <tr className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70">
                            <td className="p-3 text-slate-900 dark:text-slate-200">{data?.metadata?.norma?.parametro || "SO2"}</td>
                            <td className="p-3 text-slate-900 dark:text-slate-200">{conformityData.norma_ugm3} µg/m³</td>
                            <td className="p-3 text-slate-900 dark:text-slate-200">{conformityData.media_concentracion} µg/m³</td>
                            <td className="p-3 text-slate-900 dark:text-slate-200">{conformityData.prob_conformidad}%</td>
                            <td className="p-3">
                                <span
                                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                                        conformityData.regla_decision === "CUMPLE"
                                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    }`}
                                >
                                    {conformityData.regla_decision}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                <h4 className="mb-2 font-medium">Información adicional:</h4>
                <ul className="list-inside list-disc space-y-1">
                    <li>Zona de seguridad: {conformityData.zona_seguridad}</li>
                    <li>Límite de aceptación: {conformityData.limite_aceptacion} µg/m³</li>
                    <li>Probabilidad de aceptación falsa: {conformityData.prob_acept_falsa_porcentaje}%</li>
                    <li>
                        Fecha de análisis:{" "}
                        {date ? format(date, "d 'de' MMMM yyyy", { locale: es }) : format(new Date(), "d 'de' MMMM yyyy", { locale: es })}
                    </li>
                </ul>
            </div>
        </div>
    );
};
