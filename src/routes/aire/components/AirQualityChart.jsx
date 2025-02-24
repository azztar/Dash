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

    // Obtener el valor límite de la norma desde los metadatos
    const valorLimite = parseFloat(data.metadata?.norma?.valor_limite) || 75; // Valor por defecto de la tabla normas

    // Evaluar cumplimiento de la norma
    const evaluarCumplimiento = (concentracion) => {
        if (!valorLimite) return null;
        return concentracion <= valorLimite;
    };

    // Añadir evaluación a los datos con el valor límite de la norma
    const chartDataConEvaluacion = chartData.map((measurement) => ({
        ...measurement,
        cumpleNorma: evaluarCumplimiento(measurement.concentracion),
        excedencia: ((measurement.concentracion / valorLimite) * 100).toFixed(1),
        valorLimiteNorma: valorLimite, // Añadimos el valor límite a cada punto
    }));

    // Calcular estadísticas
    const medicionesExcedidas = chartDataConEvaluacion.filter((d) => !d.cumpleNorma).length;
    const porcentajeExcedido = ((medicionesExcedidas / chartDataConEvaluacion.length) * 100).toFixed(1);

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
            <div className="mb-4 space-y-2">
                <h2 className="text-lg font-semibold">Concentración de {parameterName}</h2>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Valores medidos por muestra</p>
                    <div className="text-sm">
                        <p className="font-medium">
                            Límite normativo:
                            <span className="ml-1 text-red-600">{valorLimite} µg/m³</span>
                        </p>
                        {/* Estadísticas de cumplimiento */}
                        <p className={medicionesExcedidas > 0 ? "text-red-600" : "text-green-600"}>
                            {medicionesExcedidas > 0
                                ? `${medicionesExcedidas} mediciones exceden el límite de ${valorLimite} µg/m³ (${porcentajeExcedido}%)`
                                : `Todas las mediciones están por debajo del límite de ${valorLimite} µg/m³`}
                        </p>
                    </div>
                </div>
            </div>
            <div className="h-[400px] w-full">
                <ResponsiveContainer>
                    <AreaChart
                        data={chartDataConEvaluacion}
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
                            domain={[0, valorLimite * 1.2]} // Escala hasta 120% del límite normativo
                            tickCount={10}
                            allowDecimals={false}
                            label={{
                                value: "Concentración (µg/m³)",
                                angle: -90,
                                position: "insideLeft",
                                offset: -10,
                            }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (!active || !payload?.length) return null;
                                const m = payload[0].payload;
                                return (
                                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                                        <h3 className="mb-2 font-semibold text-gray-900">Muestra {m.muestra}</h3>
                                        <div className="space-y-1 text-sm">
                                            <p className="text-gray-600">Hora: {m.hora}</p>
                                            <p className="font-medium text-blue-600">Concentración: {m.concentracion.toFixed(2)} µg/m³</p>
                                            <p className={m.cumpleNorma ? "text-green-600" : "text-red-600"}>
                                                {m.cumpleNorma
                                                    ? `Cumple la norma (${m.excedencia}% del límite)`
                                                    : `Excede la norma (${m.excedencia}% del límite)`}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                        {/* Línea de límite normativo */}
                        <ReferenceLine
                            y={valorLimite}
                            stroke="#dc2626"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            label={{
                                value: `Límite normativo: ${valorLimite} µg/m³`,
                                position: "right",
                                fill: "#dc2626",
                                fontSize: 12,
                            }}
                        />
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
