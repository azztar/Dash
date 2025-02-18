import React from "react";
import { Card } from "@tremor/react";
import { format } from "date-fns";

export const MeasurementsTable = ({ data }) => {
    // Validación de datos y mensaje por defecto
    if (!data?.data || !Array.isArray(data.data)) {
        console.warn("MeasurementsTable: datos inválidos", data);
        return (
            <Card>
                <div className="p-4 text-center">
                    <p className="text-gray-500">No hay datos disponibles</p>
                </div>
            </Card>
        );
    }

    const measurements = data.data;

    if (measurements.length === 0) {
        return (
            <Card>
                <div className="p-4 text-center">
                    <p className="text-gray-500">No hay mediciones para mostrar</p>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Medición</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {measurements.map((measurement) => (
                            <tr key={measurement.id_medicion_aire}>
                                <td className="whitespace-nowrap px-6 py-4">{format(new Date(measurement.fecha_inicio_muestra), "HH:mm")}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {measurement.valor_medicion} {measurement.unidad}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span
                                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                            measurement.estado === "Cumple" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {measurement.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
