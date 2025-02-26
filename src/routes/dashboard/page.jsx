import React, { useState, useEffect } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, BarChart, Bar, Legend, CartesianGrid } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

import {
    FileText,
    Wind,
    Cloud,
    Workflow,
    Bell,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    ThumbsUp,
    ChevronRight,
    BarChart2,
    PieChart as PieChartIcon,
    File,
} from "lucide-react";

const DashboardPage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    // Estados para almacenar datos
    const [isLoading, setIsLoading] = useState(true);
    const [files, setFiles] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [measurementsByType, setMeasurementsByType] = useState([]);
    const [latestMeasurement, setLatestMeasurement] = useState(null);

    // Función para cargar datos del usuario
    useEffect(() => {
        if (!token) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Cargar archivos
                const filesResponse = await axios.get(`${API_URL}/api/files/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFiles(filesResponse.data.files || []);

                // Cargar mediciones si hay estaciones asociadas
                if (user?.rol === "cliente") {
                    try {
                        // Intentar cargar mediciones recientes
                        const measurementsResponse = await axios.get(`${API_URL}/api/measurements/recent/${user.id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        setMeasurements(measurementsResponse.data.data || []);

                        // Crear datos agrupados para el gráfico de barras
                        const grouped = measurementsResponse.data.groupedByParameter || [];
                        setMeasurementsByType(grouped);

                        // Obtener la medición más reciente
                        if (measurementsResponse.data.data?.length > 0) {
                            setLatestMeasurement(measurementsResponse.data.data[0]);
                        }
                    } catch (err) {
                        console.log("No hay mediciones disponibles");
                    }
                }

                // Generar notificaciones
                generateNotifications(filesResponse.data.files || []);
            } catch (error) {
                console.error("Error al cargar datos del dashboard:", error);
                toast.error("Error al cargar datos del dashboard");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [token, user, API_URL]);

    // Generar notificaciones en base a datos
    const generateNotifications = (files) => {
        const notifications = [];

        // Notificación de archivos recientes (últimos 7 días)
        const recentFiles = files.filter((file) => {
            const fileDate = new Date(file.fecha_carga);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return fileDate >= sevenDaysAgo;
        });

        if (recentFiles.length > 0) {
            notifications.push({
                id: "recent-files",
                title: `${recentFiles.length} archivo(s) nuevo(s)`,
                description: `Tienes ${recentFiles.length} archivo(s) subido(s) en la última semana`,
                icon: <FileText className="h-5 w-5 text-blue-500" />,
                action: () => navigate("/archivos"),
                type: "info",
            });
        }

        // Notificación sobre mediciones cerca del límite
        if (measurements.length > 0) {
            const highMeasurements = measurements.filter((m) => {
                // Consideramos alto si está al 80% o más del límite
                return m.concentracion / m.valor_limite >= 0.8;
            });

            if (highMeasurements.length > 0) {
                notifications.push({
                    id: "high-measurements",
                    title: `Alerta: Mediciones cercanas al límite`,
                    description: `${highMeasurements.length} medición(es) están por encima del 80% del límite permitido`,
                    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
                    action: () => navigate("/mediciones"),
                    type: "warning",
                });
            }
        }

        // Añadir notificación de bienvenida si no hay otras
        if (notifications.length === 0) {
            notifications.push({
                id: "welcome",
                title: "Bienvenido al dashboard",
                description: "Aquí verás un resumen de tu actividad y datos importantes",
                icon: <ThumbsUp className="h-5 w-5 text-green-500" />,
                type: "success",
            });
        }

        setNotifications(notifications);
    };

    // Preparar datos para gráficos
    const prepareChartData = () => {
        if (measurements.length === 0) {
            return [];
        }

        return measurements
            .map((item) => ({
                name: new Date(item.fecha_muestra).toLocaleDateString(),
                Valor: item.concentracion,
                Límite: item.valor_limite,
            }))
            .slice(0, 10); // Mostrar solo los últimos 10
    };

    const prepareParametersData = () => {
        if (!measurementsByType || measurementsByType.length === 0) {
            // Datos de ejemplo si no hay reales
            return [
                { name: "PM10", value: 35 },
                { name: "CO", value: 25 },
                { name: "SO2", value: 20 },
                { name: "NO2", value: 20 },
            ];
        }

        return measurementsByType;
    };

    // Constantes para gráficos
    const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Renderizar tarjetas de indicadores principales
    const renderIndicatorCards = () => {
        // Si tenemos datos reales de mediciones, mostrarlos
        if (latestMeasurement) {
            const paramValue = latestMeasurement.concentracion;
            const limit = latestMeasurement.valor_limite;
            const percentage = ((paramValue / limit) * 100).toFixed(0);
            const isHigh = paramValue / limit >= 0.8;

            return (
                <>
                    <div className="card">
                        <div className="card-header">
                            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <Wind size={26} />
                            </div>
                            <p className="card-title">{latestMeasurement.parametro}</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                                {paramValue} <span className="text-lg font-normal">µg/m³</span>
                            </p>
                            <span
                                className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium ${
                                    isHigh ? "border-amber-500 text-amber-500" : "border-blue-500 text-blue-500"
                                }`}
                            >
                                {isHigh ? <TrendingUp size={18} /> : <CheckCircle size={18} />}
                                {percentage}% del límite
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <Cloud size={26} />
                            </div>
                            <p className="card-title">Estado</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{isHigh ? "Alerta" : "Normal"}</p>
                            <span
                                className={`flex w-fit items-center gap-x-2 rounded-full border px-2 py-1 font-medium ${
                                    isHigh ? "border-amber-500 text-amber-500" : "border-green-500 text-green-500"
                                }`}
                            >
                                {isHigh ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                {isHigh ? "Revisar" : "Conforme"}
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <Workflow size={26} />
                            </div>
                            <p className="card-title">Tendencia</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                                {measurements.length > 1 && measurements[0].concentracion > measurements[1].concentracion
                                    ? "↗ Subiendo"
                                    : "↘ Bajando"}
                            </p>
                            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                                {measurements.length > 1 && measurements[0].concentracion > measurements[1].concentracion ? (
                                    <TrendingUp size={18} />
                                ) : (
                                    <TrendingDown size={18} />
                                )}
                                Últimas 24h
                            </span>
                        </div>
                    </div>

                    <div
                        className="card"
                        onClick={() => navigate("/archivos")}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <FileText size={26} />
                            </div>
                            <p className="card-title">Archivos</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{files.length}</p>
                            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                                <FileText size={18} />
                                Disponibles
                            </span>
                        </div>
                    </div>
                </>
            );
        } else {
            // Indicadores por defecto si no tenemos datos reales de mediciones
            return (
                <>
                    <div
                        className="card"
                        onClick={() => navigate("/mediciones")}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="card-header">
                            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <Wind size={26} />
                            </div>
                            <p className="card-title">Calidad del aire</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">Ver datos</p>
                            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                                <BarChart2 size={18} />
                                Ver mediciones
                            </span>
                        </div>
                    </div>

                    <div
                        className="card"
                        onClick={() => navigate("/archivos")}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <File size={26} />
                            </div>
                            <p className="card-title">Archivos</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{files.length}</p>
                            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                                <FileText size={18} />
                                Disponibles
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <PieChartIcon size={26} />
                            </div>
                            <p className="card-title">Análisis</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">Informes</p>
                            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                                <TrendingUp size={18} />
                                Disponibles
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <Bell size={26} />
                            </div>
                            <p className="card-title">Notificaciones</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">{notifications.length}</p>
                            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                                <Bell size={18} />
                                Nuevas
                            </span>
                        </div>
                    </div>
                </>
            );
        }
    };

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>

            {/* Tarjetas de bienvenida y estado general */}
            <div className="card bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                <div className="p-6">
                    <h2 className="text-2xl font-bold">Bienvenido, {user?.nombre || "Usuario"}</h2>
                    <p className="mt-2 opacity-90">Aquí encontrarás un resumen de la información más relevante</p>
                </div>
            </div>

            {/* Indicadores principales */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{renderIndicatorCards()}</div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="card col-span-1 md:col-span-2 lg:col-span-4">
                    <div className="card-header">
                        <p className="card-title">Tendencias de Calidad del Aire</p>
                    </div>
                    <div className="card-body p-0">
                        {measurements.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={300}
                            >
                                <BarChart
                                    data={prepareChartData()}
                                    margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        strokeWidth={0}
                                        stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                        tickMargin={6}
                                        angle={-45}
                                        textAnchor="end"
                                    />
                                    <YAxis
                                        strokeWidth={0}
                                        stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                        tickMargin={6}
                                    />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="Valor"
                                        fill="#3b82f6"
                                    />
                                    <Bar
                                        dataKey="Límite"
                                        fill="#ef4444"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[300px] items-center justify-center">
                                <p className="text-gray-500">No hay suficientes datos para mostrar tendencias</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card col-span-1 md:col-span-2 lg:col-span-3">
                    <div className="card-header">
                        <p className="card-title">Distribución por Tipo</p>
                    </div>
                    <div className="card-body h-[300px] overflow-auto p-0">
                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >
                            <PieChart>
                                <Pie
                                    data={prepareParametersData()}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={renderCustomizedLabel}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {prepareParametersData().map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name, props) => [`${value}%`, props.payload.name]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Centro de notificaciones */}
            <div className="card">
                <div className="card-header">
                    <div className="flex items-center justify-between">
                        <p className="card-title">Centro de notificaciones</p>
                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">{notifications.length} nuevas</span>
                    </div>
                </div>
                <div className="card-body divide-y p-0">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="flex cursor-pointer items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-900"
                                onClick={notification.action}
                            >
                                <div className="flex items-center space-x-3">
                                    {notification.icon}
                                    <div>
                                        <h3 className="font-medium text-slate-900 dark:text-slate-100">{notification.title}</h3>
                                        <p className="text-sm text-slate-500">{notification.description}</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-400" />
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-slate-500">No hay notificaciones nuevas</div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default DashboardPage;
