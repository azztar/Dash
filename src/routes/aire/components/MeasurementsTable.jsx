import React from "react";
import { Card } from "@tremor/react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const MeasurementsTable = ({ data, stationName, parameterName }) => {
    console.log("🔍 Datos completos recibidos:", data);

    // Extraer datos y declaración de conformidad de forma segura
    const measurements = data?.data || [];
    const declaracionConformidad = data?.metadata?.declaracionConformidad;

    const formatFecha = (fechaStr) => {
        try {
            if (!fechaStr) return "Fecha no disponible";
            const fecha = typeof fechaStr === "string" ? parseISO(fechaStr) : new Date(fechaStr);
            if (isNaN(fecha.getTime())) {
                console.warn("⚠️ Fecha inválida:", fechaStr);
                return "Fecha inválida";
            }
            return format(fecha, "dd/MM/yyyy", { locale: es });
        } catch (error) {
            console.error("❌ Error formateando fecha:", error);
            return "Error en fecha";
        }
    };

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Muestra</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Concentración</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Incertidumbre (U)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {measurements.map((medicion) => (
                            <tr key={medicion.id_medicion_aire}>
                                <td className="whitespace-nowrap px-6 py-4">{medicion.muestra}</td>
                                <td className="whitespace-nowrap px-6 py-4">{formatFecha(medicion.fecha_muestra)}</td>
                                <td className="whitespace-nowrap px-6 py-4">{medicion.hora_muestra || "No disponible"}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {medicion.concentracion} {medicion.unidad || "µg/m³"}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">{medicion.u || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Sección de Declaración de Conformidad */}
            {declaracionConformidad && (
                <Card className="mt-6">
                    <h3 className="mb-4 text-lg font-semibold">Declaración de Conformidad</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Norma (µg/m³):</p>
                            <p className="font-medium">{declaracionConformidad.norma_ugm3}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Media de Concentración:</p>
                            <p className="font-medium">{declaracionConformidad.media_concentracion}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Probabilidad de Conformidad:</p>
                            <p className="font-medium">{declaracionConformidad.prob_conformidad}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Regla de Decisión:</p>
                            <p className={`font-medium ${declaracionConformidad.regla_decision === "CUMPLE" ? "text-green-600" : "text-red-600"}`}>
                                {declaracionConformidad.regla_decision}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
