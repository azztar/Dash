import React from "react";
import { Card } from "@tremor/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const MeasurementsTable = ({ data }) => {
    if (!data?.data || !Array.isArray(data.data)) {
        return null;
    }

    return (
        <Card>
            <h2 className="mb-4 text-lg font-semibold">Mediciones</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Muestra</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Hora</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Tiempo Muestreo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Concentración</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">U</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Factor Cobertura</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.data.map((measurement, index) => (
                            <tr
                                key={index}
                                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                            >
                                <td className="px-6 py-4">{measurement.muestra}</td>
                                <td className="px-6 py-4">{measurement.fecha_muestra}</td>
                                <td className="px-6 py-4">{measurement.hora_muestra}</td>
                                <td className="px-6 py-4">{measurement.tiempo_muestreo}</td>
                                <td className="px-6 py-4">{measurement.concentracion}</td>
                                <td className="px-6 py-4">{measurement.u}</td>
                                <td className="px-6 py-4">{measurement.u_factor_cobertura}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
