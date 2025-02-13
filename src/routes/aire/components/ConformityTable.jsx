import React from "react";
import { Card } from "@tremor/react";

export const ConformityTable = ({ data }) => {
    return (
        <Card className="mt-6 overflow-x-auto">
            <h2 className="mb-4 text-lg font-semibold">Declaración de Conformidad</h2>
            <div className="min-w-full">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="whitespace-nowrap border p-2">ID Declaración</th>
                            <th className="whitespace-nowrap border p-2">Media Concentración</th>
                            <th className="whitespace-nowrap border p-2">Límite de Aceptación</th>
                            <th className="whitespace-nowrap border p-2">Probabilidad de Conformidad</th>
                            <th className="whitespace-nowrap border p-2">Decisión</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr
                                key={item.id_declaracion}
                                className="even:bg-gray-50"
                            >
                                <td className="border p-2">{item.id_declaracion}</td>
                                <td className="border p-2">{item.media_concentracion}</td>
                                <td className="border p-2">{item.valor_limite}</td>
                                <td className="border p-2">{item.probabilidad_conformidad}%</td>
                                <td className="border p-2">{item.regla_decision}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
