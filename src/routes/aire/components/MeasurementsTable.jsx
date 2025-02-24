import React from "react";
import { Card } from "@tremor/react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const MeasurementsTable = ({ data, stationName, parameterName }) => {
    // Validación de datos
    if (!data?.data) {
        return <div>No hay datos disponibles</div>;
    }

    const measurements = data.data;
    const declaracion = data.metadata?.declaracionConformidad;

    return (
        <div className="space-y-6">
            {/* Cabecera */}
            <div className="rounded-lg bg-blue-50 p-4">
                <h2 className="text-xl font-bold text-blue-900">
                    {stationName} - {parameterName}
                </h2>
                <p className="text-blue-700">Total mediciones: {measurements.length}</p>
            </div>

            {/* Tabla de Mediciones */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Muestra</th>
                                <th className="px-4 py-2">Hora</th>
                                <th className="px-4 py-2">Concentración</th>
                                <th className="px-4 py-2">Incertidumbre</th>
                                <th className="px-4 py-2">Factor de Cobertura</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {measurements.map((medicion) => (
                                <tr key={medicion.id_medicion_aire}>
                                    <td className="px-4 py-2">{medicion.muestra}</td>
                                    <td className="px-4 py-2">{medicion.hora_muestra}</td>
                                    <td className="px-4 py-2">
                                        {medicion.concentracion} {medicion.unidad}
                                    </td>
                                    <td className="px-4 py-2">{medicion.u}</td>
                                    <td className="px-4 py-2">{medicion.u_factor_cobertura}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Declaración de Conformidad */}
            {declaracion && (
                <Card>
                    <h3 className="mb-4 text-lg font-semibold">Declaración de Conformidad</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-gray-600">Norma</p>
                            <p className="font-medium">{declaracion.norma_ugm3} µg/m³</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Media de Concentración</p>
                            <p className="font-medium">{declaracion.media_concentracion} µg/m³</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Probabilidad de Conformidad</p>
                            <p className="font-medium">{declaracion.prob_conformidad}%</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Resultado</p>
                            <p className={`font-medium ${declaracion.regla_decision === "CUMPLE" ? "text-green-600" : "text-red-600"}`}>
                                {declaracion.regla_decision}
                            </p>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};
