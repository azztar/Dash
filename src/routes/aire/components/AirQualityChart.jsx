import React from "react";
import { Card } from "@tremor/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

export const AirQualityChart = ({ data, parameterName }) => {
    if (!data?.data || !Array.isArray(data.data)) {
        return null;
    }

    // Ordenar datos por número de muestra
    const chartData = data.data
        .map((measurement) => ({
            muestra: measurement.muestra,
            concentracion: parseFloat(measurement.concentracion) || 0,
            hora: measurement.hora_muestra,
            // Obtener valor límite de la norma asociada
            limite: parseFloat(data.metadata?.norma?.valor_limite) || 0,
        }))
        .sort((a, b) => {
            // Ordenar por número de muestra (1.1, 1.2, etc.)
            const [majorA, minorA] = a.muestra.split(".").map(Number);
            const [majorB, minorB] = b.muestra.split(".").map(Number);
            return majorA !== majorB ? majorA - majorB : (minorA || 0) - (minorB || 0);
        });

    // Obtener el valor límite de la norma
    const valorLimite = parseFloat(data.metadata?.norma?.valor_limite) || 0;

    // Calcular el valor máximo para el eje Y
    const maxConcentracion = Math.max(...chartData.map((d) => d.concentracion), valorLimite);

    // Añadir un 10% de margen al máximo
    const yAxisMax = Math.ceil(maxConcentracion * 1.1);

    // Tooltip personalizado con más información
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;

        const measurement = payload[0].payload;
        return (
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                <h3 className="mb-2 font-semibold text-gray-900">Muestra {measurement.muestra}</h3>
                <div className="space-y-1 text-sm">
                    <p className="text-gray-600">Hora: {measurement.hora}</p>
                    <p className="font-medium text-blue-600">Concentración: {measurement.concentracion.toFixed(2)} µg/m³</p>
                    {measurement.limite > 0 && <p className="text-red-600">Límite normativo: {measurement.limite} µg/m³</p>}
                </div>
            </div>
        );
    };

    return (
        <Card>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Concentración de {parameterName}</h2>
                <p className="text-sm text-gray-500">Valores medidos por muestra</p>
                {valorLimite > 0 && <p className="mt-1 text-sm text-red-600">Límite normativo: {valorLimite} µg/m³</p>}
            </div>
            <div className="h-[400px] w-full">
                <ResponsiveContainer>
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                    >
                        <XAxis
                            dataKey="muestra"
                            label={{
                                value: "Número de Muestra",
                                position: "bottom",
                                offset: 0,
                            }}
                            ticks={chartData.map((d) => d.muestra)} // Mostrar todas las muestras
                        />
                        <YAxis
                            domain={[0, yAxisMax]}
                            tickCount={10}
                            allowDecimals={false}
                            label={{
                                value: "Concentración (µg/m³)",
                                angle: -90,
                                position: "insideLeft",
                                offset: -10,
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {/* Línea de límite */}
                        {valorLimite > 0 && (
                            <ReferenceLine
                                y={valorLimite}
                                stroke="#dc2626" // rojo más intenso
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{
                                    value: `Límite: ${valorLimite} µg/m³`,
                                    position: "right",
                                    fill: "#dc2626",
                                    fontSize: 12,
                                }}
                            />
                        )}
                        {/* Área de concentración */}
                        <Area
                            type="monotone"
                            dataKey="concentracion"
                            stroke="#3b82f6"
                            fill="#93c5fd"
                            strokeWidth={2}
                            name="Concentración"
                            dot={{
                                stroke: "#2563eb",
                                strokeWidth: 2,
                                r: 4,
                                fill: "#white",
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
