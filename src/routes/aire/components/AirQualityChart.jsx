import React from "react";
import { Card } from "@tremor/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { format } from "date-fns"; // Agregar esta importación
import { es } from "date-fns/locale"; // También necesitaremos esto para el formato en español

export const AirQualityChart = ({ data }) => {
    // Validación de datos
    if (!data?.data || !Array.isArray(data.data)) {
        console.warn("AirQualityChart: datos inválidos", data);
        return null;
    }

    const { theme } = useTheme();
    const measurements = data.data;

    if (measurements.length === 0) {
        return (
            <div className="p-4 text-center">
                <p className="text-gray-500">No hay datos para visualizar</p>
            </div>
        );
    }

    // Preparar datos para el gráfico
    const chartData = measurements.map((m) => ({
        hora: format(new Date(m.fecha_inicio_muestra), "HH:mm"),
        valor: parseFloat(m.valor_medicion),
        limite: parseFloat(m.valor_limite),
    }));

    return (
        <Card className="mt-6">
            <h2 className="mb-4 text-lg font-semibold">Concentración vs Tiempo</h2>
            <ResponsiveContainer
                width="100%"
                height={300}
            >
                <AreaChart data={chartData}>
                    <XAxis
                        dataKey="fecha"
                        tickFormatter={(date) => new Date(date).toLocaleDateString("es-ES")}
                        stroke={theme === "light" ? "#6B7280" : "#9CA3AF"}
                    />
                    <YAxis stroke={theme === "light" ? "#6B7280" : "#9CA3AF"} />
                    <Tooltip />
                    <ReferenceLine
                        y={75}
                        stroke="red"
                        strokeDasharray="3 3"
                        label="Norma"
                    />
                    <Area
                        type="monotone"
                        dataKey="concentracion"
                        stroke={theme === "light" ? "#3b82f6" : "#60a5fa"}
                        fill={theme === "light" ? "#3b82f6" : "#60a5fa"}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </Card>
    );
};
