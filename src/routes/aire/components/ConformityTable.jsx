import React from "react";
import { Card } from "@tremor/react";

export const ConformityTable = ({ data = [] }) => {
    // Validación de datos
    if (!data?.data || !Array.isArray(data.data)) {
        console.warn("ConformityTable: datos inválidos", data);
        return null;
    }

    const measurements = data.data;

    if (measurements.length === 0) {
        return (
            <div className="p-4 text-center">
                <p className="text-gray-500">No hay datos de conformidad disponibles</p>
            </div>
        );
    }

    // Cálculos de conformidad
    const total = measurements.length;
    const conformes = measurements.filter((m) => m.estado === "Cumple").length;
    const excedidos = total - conformes;
    const porcentajeConformidad = ((conformes / total) * 100).toFixed(2);

    return (
        <div className="space-y-4">
            <Card className="mt-6 overflow-x-auto">
                <h2 className="mb-4 text-lg font-semibold">Declaración de Conformidad</h2>
                <div className="min-w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="whitespace-nowrap border p-2">ID Declaración</th>
                                <th className="whitespace-nowrap border p-2">Media Concentración</th>
                                <th className="whitespace-nowrap border p-2">Límite de Aceptación</th>
                                <th className="whitespace-nowrap border p-2">Probabilidad de Conformidad</th>
                                <th className="whitespace-nowrap border p-2">Decisión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {measurements.map((item, index) => (
                                <tr
                                    key={item.id_declaracion || `row-${index}`} // Usar ID único o índice como fallback
                                    className="even:bg-gray-50 hover:bg-gray-50"
                                >
                                    <td className="whitespace-nowrap px-6 py-4">{item.id_declaracion}</td>
                                    <td className="whitespace-nowrap px-6 py-4">{item.media_concentracion}</td>
                                    <td className="whitespace-nowrap px-6 py-4">{item.valor_limite}</td>
                                    <td className="whitespace-nowrap px-6 py-4">{item.probabilidad_conformidad}%</td>
                                    <td className="whitespace-nowrap px-6 py-4">{item.regla_decision}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
            <Card>
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Resumen de Conformidad</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-green-50 p-4">
                            <p className="text-sm text-green-600">Mediciones Conformes</p>
                            <p className="mt-2 text-2xl font-semibold text-green-700">{conformes}</p>
                        </div>
                        <div className="rounded-lg bg-red-50 p-4">
                            <p className="text-sm text-red-600">Mediciones Excedidas</p>
                            <p className="mt-2 text-2xl font-semibold text-red-700">{excedidos}</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-600">Porcentaje de Conformidad</p>
                            <p className="mt-2 text-2xl font-semibold text-blue-700">{porcentajeConformidad}%</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
