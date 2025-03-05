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
    const [files, setFiles] = useState(() => {
        try {
            const saved = localStorage.getItem("dashboard_files");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [measurements, setMeasurements] = useState(() => {
        try {
            const saved = localStorage.getItem("dashboard_measurements");
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    const [latestMeasurement, setLatestMeasurement] = useState(() => {
        try {
            const saved = localStorage.getItem("dashboard_latestMeasurement");
            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    });

    const [notifications, setNotifications] = useState([]);
    const [measurementsByType, setMeasurementsByType] = useState([]);

    // Función para cargar datos del usuario
    useEffect(() => {
        if (!token) return;

        const lastFetch = localStorage.getItem("dashboard_timestamp");
        const currentTime = Date.now();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

        // Si los datos tienen menos de 5 minutos, no hace falta recargarlos
        if (lastFetch && currentTime - parseInt(lastFetch) < CACHE_DURATION) {
            setIsLoading(false);
            return; // No recarga datos
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Cargar archivos
                const filesResponse = await axios.get(`${API_URL}/api/files/list`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setFiles(filesResponse.data.files || []);

                // Cargar mediciones si hay estaciones asociadas
                if (user?.rol === "cliente" && user?.id) {
                    try {
                        console.log("Consultando mediciones para usuario:", user.id);
                        const measurementsResponse = await axios.get(`${API_URL}/api/measurements/recent/${user.id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });

                        console.log("Respuesta de mediciones:", measurementsResponse.data);

                        if (measurementsResponse.data.data && measurementsResponse.data.data.length > 0) {
                            setMeasurements(measurementsResponse.data.data);
                            setMeasurementsByType(measurementsResponse.data.groupedByParameter || []);
                            setLatestMeasurement(measurementsResponse.data.data[0]);
                        } else {
                            console.log("No hay datos de mediciones disponibles");
                        }
                    } catch (err) {
                        console.error("Error al cargar mediciones:", err.response?.data || err.message);
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

            const saveDataToLocalStorage = () => {
                // Guardar datos importantes en localStorage
                localStorage.setItem("dashboard_measurements", JSON.stringify(measurementsResponse.data.data || []));
                localStorage.setItem("dashboard_files", JSON.stringify(filesResponse.data.files || []));
                localStorage.setItem(
                    "dashboard_latestMeasurement",
                    measurementsResponse.data.data?.length > 0 ? JSON.stringify(measurementsResponse.data.data[0]) : null,
                );
                localStorage.setItem("dashboard_timestamp", Date.now().toString());
            };

            saveDataToLocalStorage();
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

                    <div
                        className="card"
                        onClick={() => navigate("/informes")}
                        style={{ cursor: "pointer" }}
                    >
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <FileText size={26} />
                            </div>
                            <p className="card-title">Informes</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">Ver informes</p>
                            <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                                <FileText size={18} />
                                Disponibles
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <p className="card-title">Estado de Cumplimiento</p>
                        </div>
                        <div className="card-body">
                            <div className="flex items-center justify-between">
                                <p>Norma CO (8h)</p>
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">CUMPLE</span>
                            </div>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                <div
                                    className="h-full bg-green-500"
                                    style={{ width: "28%" }}
                                ></div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Concentración actual: 28% del límite permitido</p>
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
                        onClick={() => navigate("/aire")} // Cambia esta línea
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
                </>
            );
        }
    };

    function parseNumberWithLocale(value) {
        if (!value) return 0;
        // Convierte la entrada a string si no lo es
        const strValue = value.toString();
        // Reemplaza coma por punto para el procesamiento
        return parseFloat(strValue.replace(",", "."));
    }

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>

            {/* Tarjetas de bienvenida y estado general */}
            <div className="card bg-gradient-to-r from-blue-500 to-blue-700 text-white">
                <div className="p-6">
                    <h2 className="text-2xl font-bold">
                        Bienvenido, {user?.rol === "cliente" ? user?.nombre_empresa || user?.nombre_usuario : user?.nombre || "Usuario"}
                    </h2>
                    <p className="mt-2 opacity-90">
                        {user?.rol === "cliente"
                            ? `Panel de control para ${user?.nombre_empresa || user?.nombre_usuario || "su empresa"}`
                            : "Aquí encontrarás un resumen de la información más relevante"}
                    </p>
                </div>
            </div>

            {/* Indicadores principales */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Indicadores principales */}
                {renderIndicatorCards()}

                {/* Centro de notificaciones */}
                <div className="card col-span-1 md:col-span-2 lg:col-span-1">
                    <div className="card-header">
                        <div className="flex items-center justify-between">
                            <p className="card-title">Notificaciones</p>
                            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                {notifications.length} nuevas
                            </span>
                        </div>
                    </div>
                    <div className="card-body max-h-[320px] divide-y overflow-y-auto p-0">
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
            </div>

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

            <div className="card">
                <div className="card-header">
                    <p className="card-title">Resumen de Mediciones</p>
                </div>
                <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-slate-500">Promedio CO:</p>
                            <p className="text-xl font-bold">
                                {measurements.length > 0
                                    ? (
                                          measurements.reduce((acc, m) => acc + parseNumberWithLocale(m.concentracion), 0) / measurements.length
                                      ).toFixed(2)
                                    : "N/A"}{" "}
                                µg/m³
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Medición más alta:</p>
                            <p className="text-xl font-bold">
                                {measurements.length > 0
                                    ? Math.max(...measurements.map((m) => parseNumberWithLocale(m.concentracion))).toFixed(2)
                                    : "N/A"}{" "}
                                µg/m³
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="text-right text-sm text-slate-500">
                <p>Última actualización: {new Date().toLocaleString()}</p>
            </div>

            <Footer />
        </div>
    );
};

export default DashboardPage;
