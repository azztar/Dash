import React, { useState, useEffect } from "react";
import { Card } from "@tremor/react";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Tooltip, Area, ReferenceLine } from "recharts";
import { useMediaQuery } from "@/hooks/use-media-query";

export const AirQualityChart = ({ data, parameterName }) => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [chartData, setChartData] = useState([]);
    const [chartDataConEvaluacion, setChartDataConEvaluacion] = useState([]);
    const [valorLimite, setValorLimite] = useState(0);
    const [medicionesExcedidas, setMedicionesExcedidas] = useState(0);
    const [porcentajeExcedido, setPorcentajeExcedido] = useState(0);

    useEffect(() => {
        if (data?.data?.length > 0) {
            // Procesar datos
            const processedData = data.data.map((item, index) => ({
                muestra: item.muestra || `M${index + 1}`,
                hora: item.hora || "-",
                concentracion: parseFloat(item.concentracion),
                cumpleNorma: parseFloat(item.concentracion) <= parseFloat(item.valor_limite || 0),
                excedencia: item.valor_limite ? Math.round((parseFloat(item.concentracion) / parseFloat(item.valor_limite)) * 100) : 0,
            }));

            setChartData(processedData);
            setChartDataConEvaluacion(processedData);

            // Calcular límite y excedencias
            if (data.data[0]?.valor_limite) {
                const limite = parseFloat(data.data[0].valor_limite);
                setValorLimite(limite);

                const excedidos = data.data.filter((item) => parseFloat(item.concentracion) > limite).length;
                setMedicionesExcedidas(excedidos);
                setPorcentajeExcedido(Math.round((excedidos / data.data.length) * 100));
            }
        }
    }, [data]);

    // Colores para tema claro/oscuro
    const chartColors = {
        line: "#3b82f6", // azul para línea principal
        limit: "#ef4444", // rojo para límite
        grid: "#e2e8f0", // gris para grilla
        text: "#475569", // texto
        background: "rgba(255, 255, 255, 0.95)", // fondo tooltip
        border: "#e2e8f0", // borde
    };

    return (
        <Card>
            <div className="mb-4 space-y-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Concentración de {parameterName}</h2>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Valores medidos por muestra</p>
                    <div className="text-sm">
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                            Límite normativo:
                            <span className="ml-1 text-red-600 dark:text-red-400">{valorLimite} µg/m³</span>
                        </p>
                        <p className={`${medicionesExcedidas > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                            {medicionesExcedidas > 0
                                ? `${medicionesExcedidas} mediciones exceden el límite de ${valorLimite} µg/m³ (${porcentajeExcedido}%)`
                                : `Todas las mediciones están por debajo del límite de ${valorLimite} µg/m³`}
                        </p>
                    </div>
                </div>
            </div>
            <div
                className="w-full"
                style={{ height: isMobile ? "300px" : "min(70vh, 400px)" }}
            >
                <ResponsiveContainer>
                    <AreaChart
                        data={
                            isMobile && chartDataConEvaluacion.length > 15
                                ? chartDataConEvaluacion.filter((_, i) => i % 3 === 0)
                                : chartDataConEvaluacion
                        }
                        margin={{ top: 10, right: 30, left: 20, bottom: isMobile ? 40 : 30 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={chartColors.grid}
                        />
                        <XAxis
                            dataKey="muestra"
                            tick={{ fontSize: isMobile ? 10 : 12 }}
                            angle={isMobile ? -45 : 0}
                            textAnchor={isMobile ? "end" : "middle"}
                            height={isMobile ? 60 : 30}
                            label={{
                                value: "Número de Muestra",
                                position: "bottom",
                                offset: 0,
                                fill: chartColors.text,
                            }}
                        />
                        <YAxis
                            domain={[0, valorLimite * 1.2]}
                            tickCount={isMobile ? 5 : 10}
                            allowDecimals={false}
                            tick={{ fontSize: isMobile ? 10 : 12 }}
                            width={isMobile ? 30 : 40}
                            label={{
                                value: "Concentración (µg/m³)",
                                angle: -90,
                                position: "insideLeft",
                                offset: -10,
                                fill: chartColors.text,
                            }}
                        />
                        <Tooltip
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const m = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                            <h3 className="mb-2 font-semibold text-slate-900 dark:text-white">Muestra {m.muestra}</h3>
                                            <div className="space-y-1 text-sm">
                                                <p className="text-slate-600 dark:text-slate-400">Hora: {m.hora}</p>
                                                <p className="font-medium text-blue-600 dark:text-blue-400">
                                                    Concentración: {m.concentracion.toFixed(2)} µg/m³
                                                </p>
                                                <p
                                                    className={
                                                        m.cumpleNorma ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                                    }
                                                >
                                                    {m.cumpleNorma
                                                        ? `Cumple la norma (${m.excedencia}% del límite)`
                                                        : `Excede la norma (${m.excedencia}% del límite)`}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {/* Línea de límite normativo */}
                        <ReferenceLine
                            y={valorLimite}
                            stroke={chartColors.limit}
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                                value: `Límite normativo: ${valorLimite} µg/m³`,
                                position: "right",
                                fill: chartColors.limit,
                                fontSize: 12,
                            }}
                        />
                        <Area
                            type="monotone"
                            dataKey="concentracion"
                            stroke={chartColors.line}
                            fill="#93c5fd"
                            strokeWidth={2}
                            name="Concentración"
                            dot={{
                                stroke: "#2563eb",
                                strokeWidth: 2,
                                r: 4,
                                fill: "white",
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};
