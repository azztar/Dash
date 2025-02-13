import React from "react";
import { Card } from "@tremor/react";

export const MeasurementsTable = ({ data }) => {
    return (
        <Card className="mt-6 overflow-x-auto">
            <h2 className="mb-4 text-lg font-semibold">Mediciones</h2>
            <div className="min-w-full">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="whitespace-nowrap border p-2">ID Medición</th>
                            <th className="whitespace-nowrap border p-2">Fecha y Hora</th>
                            <th className="whitespace-nowrap border p-2">Tiempo Muestreo (min)</th>
                            <th className="whitespace-nowrap border p-2">Concentración</th>
                            <th className="whitespace-nowrap border p-2">Incertidumbre</th>
                            <th className="whitespace-nowrap border p-2">Factor Cobertura</th>
                            <th className="whitespace-nowrap border p-2">Límite</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr
                                key={item.id_medicion_aire}
                                className="even:bg-gray-50"
                            >
                                <td className="border p-2">{item.id_medicion_aire}</td>
                                <td className="border p-2">{new Date(item.fecha_hora_inicial).toLocaleString()}</td>
                                <td className="border p-2">{item.tiempo_muestreo}</td>
                                <td className="border p-2">{item.concentracion}</td>
                                <td className="border p-2">{item.u}</td>
                                <td className="border p-2">{item.u_factor_cobertura}</td>
                                <td className="border p-2">
                                    {item.valor_limite} {item.unidad}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
