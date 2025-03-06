import React from "react";
import { Card } from "@tremor/react";

export const ConformityTable = ({ data = [] }) => {
    if (!data?.conformity || !Array.isArray(data.conformity)) {
        return null;
    }

    return (
        <Card>
            <h2 className="mb-4 text-lg font-semibold">Declaración de Conformidad</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Norma (µg/m³)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Zona Seguridad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Límite Aceptación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Media</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Prob. Aceptación Falsa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Prob. Conformidad</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Regla Decisión</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {data.conformity.map((item, index) => (
                            <tr key={index}>
                                <td className="px-6 py-4">{item.norma_ugm3}</td>
                                <td className="px-6 py-4">{item.zona_seguridad}</td>
                                <td className="px-6 py-4">{item.limite_aceptacion}</td>
                                <td className="px-6 py-4">{item.media_concentracion}</td>
                                <td className="px-6 py-4">{item.prob_acept_falsa}%</td>
                                <td className="px-6 py-4">{item.prob_conformidad}%</td>
                                <td className="px-6 py-4">{item.regla_decision}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
