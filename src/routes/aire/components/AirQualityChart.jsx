import React from "react";
import { Card } from "@tremor/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTheme } from "@/hooks/use-theme";

export const AirQualityChart = ({ data }) => {
    const { theme } = useTheme();

    return (
        <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold">Concentración vs Tiempo</h2>
            <ResponsiveContainer
                width="100%"
                height={300}
            >
                <AreaChart data={data}>
                    <XAxis
                        dataKey="fecha_hora_inicial"
                        tickMargin={10}
                        stroke={theme === "light" ? "#6B7280" : "#9CA3AF"}
                    />
                    <YAxis
                        domain={[0, 100]}
                        tickFormatter={(value) => `${value}`}
                        tickMargin={6}
                        stroke={theme === "light" ? "#6B7280" : "#9CA3AF"}
                    />
                    <Tooltip />
                    <ReferenceLine
                        y={75}
                        stroke="red"
                        strokeDasharray="3 3"
                        label="Norma (75 µg/m³)"
                    />
                    <Area
                        type="monotone"
                        dataKey="concentracion_pm10"
                        stroke={theme === "light" ? "#3b82f6" : "#60a5fa"}
                        fill={theme === "light" ? "#3b82f6" : "#60a5fa"}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};
