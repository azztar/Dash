import React from "react";
import { Card } from "@tremor/react";

export const MeasurementsTable = ({ data }) => {
    return (
        <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold">Mediciones</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Muestra</th>
                        <th className="border p-2">Fecha y Hora Inicial</th>
                        <th className="border p-2">Tiempo Muestreo (min)</th>
                        <th className="border p-2">Concentración (µg/m³)</th>
                        <th className="border p-2">U (µg/m³)</th>
                        <th className="border p-2">U Factor Cobertura</th>
                        <th className="border p-2">Norma</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            className="even:bg-gray-50"
                        >
                            <td className="border p-2">{item.muestra}</td>
                            <td className="border p-2">{item.fecha_hora_inicial}</td>
                            <td className="border p-2">{item.tiempo_muestreo_minutos}</td>
                            <td className="border p-2">{item.concentracion_pm10}</td>
                            <td className="border p-2">{item.u_pm10}</td>
                            <td className="border p-2">{item.u_pm10_factor_cobertura}</td>
                            <td className="border p-2">{item.norma_pm10_24_horas}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};
