import React, { memo } from "react";
import { Card } from "@tremor/react";
import { LoadingState } from "./LoadingState";

export const MeasurementsTable = memo(
    ({ data, stationName, parameterName, loading }) => {
        // Logging mejorado
        console.log("🔄 MeasurementsTable:", {
            loading,
            hayDatos: Boolean(data?.data),
            totalMediciones: data?.data?.length || 0,
            estacion: stationName,
            parametro: parameterName,
        });

        if (loading) {
            return <LoadingState />;
        }

        if (!data?.data?.length) {
            return (
                <Card className="p-4">
                    <p className="text-center text-gray-500">
                        No hay datos disponibles para {parameterName} en {stationName}
                    </p>
                </Card>
            );
        }

        const measurements = data.data;
        const declaracion = data.metadata?.declaracionConformidad;

        return (
            <div className="space-y-6">
                {/* Tabla de Mediciones */}
                <Card className="overflow-hidden">
                    <h3 className="border-b bg-gray-50 p-4 text-lg font-semibold">
                        Mediciones de {parameterName} - {stationName}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Muestra</th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Hora</th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Concentración</th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Incertidumbre</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {measurements.map((m) => (
                                    <tr
                                        key={m.id_medicion_aire}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4">{m.muestra}</td>
                                        <td className="whitespace-nowrap px-6 py-4">{m.hora_muestra}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            {m.concentracion} {m.unidad}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">{m.u}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Declaración de Conformidad */}
                {declaracion && (
                    <Card className="overflow-hidden">
                        <h3 className="border-b bg-gray-50 p-4 text-lg font-semibold">Declaración de Conformidad</h3>
                        <div className="p-4">
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Norma</dt>
                                    <dd className="mt-1 text-lg text-gray-900">{declaracion.norma_ugm3} µg/m³</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Media</dt>
                                    <dd className="mt-1 text-lg text-gray-900">{declaracion.media_concentracion} µg/m³</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Probabilidad</dt>
                                    <dd className="mt-1 text-lg text-gray-900">{declaracion.prob_conformidad}%</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Resultado</dt>
                                    <dd
                                        className={`mt-1 text-lg font-semibold ${
                                            declaracion.regla_decision === "CUMPLE" ? "text-green-600" : "text-red-600"
                                        }`}
                                    >
                                        {declaracion.regla_decision}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </Card>
                )}
            </div>
        );
    },
    // Optimización de la comparación para memo
    (prevProps, nextProps) => {
        const dataChanged =
            prevProps.data?.data?.length === nextProps.data?.data?.length &&
            prevProps.data?.metadata?.declaracionConformidad?.id_declaracion === nextProps.data?.metadata?.declaracionConformidad?.id_declaracion;

        const propsChanged =
            prevProps.stationName === nextProps.stationName &&
            prevProps.parameterName === nextProps.parameterName &&
            prevProps.loading === nextProps.loading;

        return dataChanged && propsChanged;
    },
);
