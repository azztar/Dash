// src/routes/analisis/page.jsx
import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { overviewData, recentSalesData, topProducts } from "@/constants";
import { useTheme } from "@/hooks/use-theme";

const AnalisisPage = () => {
    const { theme } = useTheme(); // Accede al tema actual

    return (
        <div className="min-h-screen bg-slate-100 p-6 transition-colors dark:bg-slate-950">
            {/* Título de la página */}
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-50">Panel de Análisis</h1>

            {/* Sección de métricas clave */}
            <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total de Productos"
                    value={topProducts.length.toString()}
                    percentage="25%"
                />
                <MetricCard
                    title="Órdenes Pagadas Totales"
                    value={`$${recentSalesData.reduce((sum, sale) => sum + sale.total, 0)}`}
                    percentage="12%"
                />
                <MetricCard
                    title="Total de Clientes"
                    value={recentSalesData.length.toString()}
                    percentage="15%"
                />
                <MetricCard
                    title="Ventas"
                    value={overviewData.reduce((sum, month) => sum + month.total, 0).toString()}
                    percentage="19%"
                />
            </div>

            {/* Gráfico de tendencias */}
            <div className="mb-6 rounded-lg bg-white p-6 shadow dark:bg-gray-800">
                <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-50">Tendencias de Ventas</h2>
                <ResponsiveContainer
                    width="100%"
                    height={300}
                >
                    <AreaChart data={overviewData}>
                        <XAxis
                            dataKey="name"
                            tickMargin={10}
                            stroke="#6B7280" // Color del eje X
                        />
                        <YAxis
                            tickFormatter={(value) => `$${value}`}
                            tickMargin={6}
                            stroke="#6B7280" // Color del eje Y
                        />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#3b82f6" // Color de la línea
                            fill="#3b82f6" // Color del área
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// Componente reutilizable para las métricas clave
const MetricCard = ({ title, value, percentage }) => {
    return (
        <div className="rounded-lg bg-white p-4 text-center shadow dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">{value}</p>
            <p className="mt-1 text-sm text-green-500">{percentage} increase</p>
        </div>
    );
};

export default AnalisisPage;
