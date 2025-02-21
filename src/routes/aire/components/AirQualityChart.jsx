import React from "react";
import { Card } from "@tremor/react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";

export const AirQualityChart = ({ data, parameterName }) => {
    if (!data?.data || !Array.isArray(data.data)) {
        return null;
    }

    // Asegurarse que los valores son números válidos
    const chartData = data.data.map((measurement) => ({
        hora: measurement.hora_muestra || "",
        concentracion: parseFloat(measurement.concentracion) || 0,
        muestra: measurement.muestra || "",
        limite: parseFloat(data.conformity?.[0]?.norma_ugm3) || 0,
    }));

    // Configuración personalizada del tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload?.length) return null;

        return (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
                <p className="font-semibold text-gray-900">Muestra: {payload[0].payload.muestra}</p>
                <p className="text-sm text-gray-600">Hora: {payload[0].payload.hora}</p>
                <p className="text-sm text-blue-600">Concentración: {payload[0].value.toFixed(2)} µg/m³</p>
            </div>
        );
    };

    return (
        <Card>
            <div className="mb-4">
                <h2 className="text-lg font-semibold">Concentración de {parameterName}</h2>
                <p className="text-sm text-gray-500">Valores medidos durante el período de muestreo</p>
            </div>
            <div className="h-[400px] w-full">
                <ResponsiveContainer>
                    <AreaChart data={chartData}>
                        <XAxis
                            dataKey="hora"
                            tickFormatter={(value) => value.split(":")[0] + "h"}
                        />
                        <YAxis
                            label={{
                                value: "µg/m³",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="concentracion"
                            stroke="#3b82f6"
                            fill="#93c5fd"
                            strokeWidth={2}
                        />
                        {chartData[0]?.limite > 0 && (
                            <ReferenceLine
                                y={chartData[0].limite}
                                label="Límite normativo"
                                stroke="#ef4444"
                                strokeDasharray="3 3"
                            />
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
