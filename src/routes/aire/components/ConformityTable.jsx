import React from "react";
import { Card } from "@tremor/react";

export const ConformityTable = ({ data }) => {
    return (
        <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold">Declaración de Conformidad</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">ID Declaración</th>
                        <th className="border p-2">Media Concentración</th>
                        <th className="border p-2">Límite de Aceptación</th>
                        <th className="border p-2">Probabilidad de Conformidad</th>
                        <th className="border p-2">Decisión</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={index}
                            className="even:bg-gray-50"
                        >
                            <td className="border p-2">{item.id_declaracion}</td>
                            <td className="border p-2">{item.media_concentracion}</td>
                            <td className="border p-2">{item.limite_aceptacion}</td>
                            <td className="border p-2">{item.probabilidad_conformidad}%</td>
                            <td className="border p-2">{item.regla_decision}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};
