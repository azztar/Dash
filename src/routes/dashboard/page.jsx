import React, { useState, useEffect } from "react";
import {
    Area,
    AreaChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend,
    CartesianGrid,
    LineChart,
    Line,
    ReferenceLine,
} from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useResponsive } from "@/hooks/useResponsive";
import { WeatherCard } from "@/components/Weather/WeatherCard";

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

// Importar el contexto
import { useNotifications } from "@/contexts/NotificationContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Mapa de colores para los diferentes parámetros
const COLORS_MAP = {
    PM10: "#ef4444",
    SO2: "#3b82f6",
    "PM2.5": "#a855f7",
    NO2: "#22c55e",
    CO: "#fb923c",
    O3: "#06b6d4",
};

// Función para aclarar colores en dark mode
const lightenColor = (hexColor) => {
    // Convertir el color hex a RGB
    let r = parseInt(hexColor.slice(1, 3), 16);
    let g = parseInt(hexColor.slice(3, 5), 16);
    let b = parseInt(hexColor.slice(5, 7), 16);

    // Aclarar los componentes
    r = Math.min(255, r + 60);
    g = Math.min(255, g + 60);
    b = Math.min(255, b + 60);

    // Convertir de vuelta a hexadecimal
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const DashboardPage = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const { token, user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;
    const { isMobile } = useResponsive();
    const { generateNotifications } = useNotifications();

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

    const [measurementsByType, setMeasurementsByType] = useState([]);
    const [parametersLimits, setParametersLimits] = useState({});

    const [userDisplay, setUserDisplay] = useState(() => {
        const savedUser = localStorage.getItem("user_data");
        return savedUser ? JSON.parse(savedUser) : user;
    });

    // Añadir este useEffect al inicio:
    useEffect(() => {
        // Limpiar caché en montaje inicial para garantizar datos frescos
        if (user?.id) {
            const storedUserId = localStorage.getItem("current_dashboard_user");
            if (!storedUserId || storedUserId !== user.id.toString()) {
                console.log("Limpiando caché por cambio de usuario o primer carga");
                localStorage.removeItem("dashboard_measurements");
                localStorage.removeItem("dashboard_latestMeasurement");
                localStorage.removeItem("dashboard_files");
                localStorage.setItem("current_dashboard_user", user.id.toString());
            }
        }
    }, [user?.id]);

    // Función para cargar datos del usuario
    useEffect(() => {
        if (!token) return;

        // AÑADIR ESTA VERIFICACIÓN DE USUARIO AQUÍ
        const cachedUserId = localStorage.getItem("cache_user_id");
        if (user?.id && cachedUserId && cachedUserId !== user.id.toString()) {
            // Si el usuario ha cambiado, forzar limpieza del caché
            console.log("Usuario cambiado, limpiando caché...");
            localStorage.removeItem("dashboard_measurements");
            localStorage.removeItem("dashboard_latestMeasurement");
            localStorage.removeItem("dashboard_files");
            localStorage.removeItem("dashboard_timestamp");
            localStorage.setItem("cache_user_id", user.id.toString());
        } else if (user?.id && !cachedUserId) {
            // Si es primera carga, establecer el ID de usuario
            localStorage.setItem("cache_user_id", user.id.toString());
        }

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
                            // Añadir esta línea:
                            setParametersLimits(measurementsResponse.data.parametersLimits || {});

                            // Guardar en localStorage aquí, donde measurementsResponse está disponible
                            localStorage.setItem("dashboard_measurements", JSON.stringify(measurementsResponse.data.data || []));
                            localStorage.setItem(
                                "dashboard_latestMeasurement",
                                measurementsResponse.data.data.length > 0 ? JSON.stringify(measurementsResponse.data.data[0]) : null,
                            );

                            // Añadir esto después de procesar la respuesta API
                            console.log("Datos para gráfico de distribución:", {
                                raw: measurementsResponse.data.groupedByParameter,
                                processed: prepareParametersData(),
                            });
                        } else {
                            console.log("No hay datos de mediciones disponibles");
                        }
                    } catch (err) {
                        console.error("Error al cargar mediciones:", err.response?.data || err.message);
                    }
                }

                // Generar notificaciones
                generateNotifications(filesResponse.data.files || [], measurements);
            } catch (error) {
                console.error("Error al cargar datos del dashboard:", error);
                toast.error("Error al cargar datos del dashboard");
            } finally {
                setIsLoading(false);
            }

            // Guardar datos en localStorage justo después de establecer los estados
            localStorage.setItem("dashboard_files", JSON.stringify(files));
            localStorage.setItem("dashboard_timestamp", Date.now().toString());
        };

        fetchData();
    }, [token, user, API_URL, generateNotifications]);

    // Añade un log para verificar qué datos están llegando:
    useEffect(() => {
        console.log("Datos de usuario en dashboard:", user);
    }, [user]);

    useEffect(() => {
        if (user && user.id && user.nombre && user.empresa) {
            setUserDisplay(user);
        }
    }, [user]);

    // Preparar datos para gráficos
    const prepareChartData = () => {
        const usedDates = new Set();
        const uniqueData = [];
        let index = 0; // Contador único para asegurar claves únicas

        measurements.forEach((item) => {
            const dateObj = new Date(item.fecha_muestra);
            const dateStr = format(dateObj, "d MMM", { locale: es });

            // Agregar un pequeño offset aleatorio para evitar valores exactamente iguales
            const randomOffset = Math.random() * 0.05;

            // Usar un contador único como parte de la clave
            if (!usedDates.has(dateStr)) {
                usedDates.add(dateStr);

                uniqueData.push({
                    name: dateStr,
                    Valor: parseFloat((parseFloat(item.concentracion) + randomOffset).toFixed(2)),
                    Límite: parseFloat(item.valor_limite),
                    // ID genuinamente único usando contador
                    id: `measure-${index++}-${Date.now()}`,
                });
            }
        });

        // Tomar solo los últimos 10 elementos para evitar sobrecarga
        return uniqueData.slice(-10);
    };

    // 1. Mejora en la función de preparación de datos
    const prepareParametersData = () => {
        if (!measurementsByType || measurementsByType.length === 0) {
            return [];
        }

        // Asegurar que los valores suman 100% para mejor visualización
        const total = measurementsByType.reduce((sum, item) => sum + item.value, 0);

        return measurementsByType.map((item) => ({
            name: item.name,
            value: item.value,
            percentage: ((item.value / total) * 100).toFixed(1),
            // Asumimos que estos datos están disponibles o se pueden calcular
            max: item.max || 0,
            min: item.min || 0,
            avg: item.avg || 0,
            unit: item.unit || "µg/m³",
        }));
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

    // Reducir el número de cards de indicadores
    const renderIndicatorCards = () => {
        if (latestMeasurement) {
            const paramValue = latestMeasurement.concentracion;
            const limit = latestMeasurement.valor_limite;
            const percentage = ((paramValue / limit) * 100).toFixed(0);
            const isHigh = paramValue / limit >= 0.8;

            return (
                <>
                    {/* Card consolidada con los datos principales */}
                    <div className="card group col-span-1 transition-all hover:border-blue-200 dark:hover:border-blue-800 lg:col-span-2">
                        <div className="card-header border-b-0">
                            <div className="dashboard-icon bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 dark:bg-blue-600/10 dark:text-blue-400 dark:group-hover:bg-blue-600/20">
                                <Wind size={26} />
                            </div>
                            <div className="flex w-full justify-between">
                                <p className="card-title">{latestMeasurement.parametro}</p>
                                <span className={`indicator-badge ${isHigh ? "border-amber-500 text-amber-500" : "border-green-500 text-green-500"}`}>
                                    {isHigh ? "Alerta" : "Normal"}
                                </span>
                            </div>
                        </div>
                        <div className="card-body bg-gradient-to-br from-slate-50 to-slate-100 pt-2 dark:from-slate-900 dark:to-slate-950">
                            <div className="flex items-center justify-between">
                                <p className="indicator-value">
                                    {paramValue} <span className="text-lg font-normal opacity-70">µg/m³</span>
                                </p>
                                <div className="text-right">
                                    <span className={`flex items-center gap-1 ${isHigh ? "text-amber-500" : "text-blue-500"}`}>
                                        {isHigh ? <TrendingUp size={18} /> : <CheckCircle size={18} />}
                                        {percentage}% del límite
                                    </span>
                                    <p className="text-sm text-slate-500">
                                        {measurements.length > 1 && measurements[0].concentracion > measurements[1].concentracion
                                            ? "Tendencia: ↗ Subiendo"
                                            : "Tendencia: ↘ Bajando"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800">
                                <div
                                    className={`h-full rounded-full ${
                                        percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-amber-500" : "bg-green-500"
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Archivos e informes en una única card */}
                    <div className="card">
                        <div className="card-header">
                            <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <FileText size={26} />
                            </div>
                            <p className="card-title">Documentos</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-2xl font-bold text-slate-900 transition-colors dark:text-slate-50">{files.length}</p>
                                    <span className="flex w-fit items-center gap-x-2 rounded-full border border-blue-500 px-2 py-1 font-medium text-blue-500 dark:border-blue-600 dark:text-blue-600">
                                        <FileText size={18} />
                                        Archivos
                                    </span>
                                </div>
                                <div
                                    className="ml-4 cursor-pointer rounded-lg bg-blue-100 px-3 py-2 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                                    onClick={() => navigate("/archivos")}
                                >
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            );
        } else {
            // Versión simplificada sin datos disponibles
            return (
                <>
                    <div className="card col-span-1 lg:col-span-3">
                        <div className="card-header">
                            <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                <Wind size={26} />
                            </div>
                            <p className="card-title">Calidad del aire</p>
                        </div>
                        <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                            <div className="flex items-center">
                                <p className="text-xl font-bold text-slate-900 transition-colors dark:text-slate-50">No hay mediciones disponibles</p>
                                <button
                                    className="ml-auto rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
                                    onClick={() => navigate("/aire")}
                                >
                                    Ver datos
                                </button>
                            </div>
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

    // Función para obtener las mediciones máximas agrupadas por parámetro
    const getMaxMeasurementsByParameter = () => {
        if (measurements.length === 0) return [];

        // Agrupar mediciones por parámetro
        const groupedByParam = {};

        measurements.forEach((m) => {
            // Si el parámetro no existe en el grupo, inicializarlo
            if (!groupedByParam[m.parametro]) {
                groupedByParam[m.parametro] = [];
            }

            // Añadir la medición al grupo correspondiente
            groupedByParam[m.parametro].push(m);
        });

        // Encontrar el máximo de cada parámetro
        return Object.keys(groupedByParam)
            .map((param) => {
                const paramMeasurements = groupedByParam[param];

                // Encontrar la medición con la concentración más alta
                const maxMeasurement = paramMeasurements.reduce((max, current) => {
                    return parseNumberWithLocale(current.concentracion) > parseNumberWithLocale(max.concentracion) ? current : max;
                }, paramMeasurements[0]);

                return {
                    parametro: param,
                    concentracion: maxMeasurement.concentracion,
                    fecha: maxMeasurement.fecha_muestra,
                    unidad: maxMeasurement.unidad || "µg/m³",
                    limite: maxMeasurement.valor_limite,
                    estacion: maxMeasurement.id_estacion,
                    periodo: maxMeasurement.fecha_inicio_muestra,
                };
            })
            .sort((a, b) => {
                // Ordenar por porcentaje respecto al límite (descendente)
                const percentA = parseNumberWithLocale(a.concentracion) / a.limite;
                const percentB = parseNumberWithLocale(b.concentracion) / b.limite;
                return percentB - percentA;
            });
    };

    // Función para preparar datos históricos para el gráfico
    const prepareHistoricalDataByParameter = () => {
        if (measurements.length === 0) return [];

        // Agrupar mediciones por fecha y parámetro
        const groupedByDate = {};

        measurements.forEach((m) => {
            const date = new Date(m.fecha_muestra).toLocaleDateString();

            if (!groupedByDate[date]) {
                groupedByDate[date] = {};
            }

            groupedByDate[date][m.parametro] = parseNumberWithLocale(m.concentracion);
        });

        // Convertir el objeto agrupado en un array de datos
        return Object.keys(groupedByDate).map((date) => ({
            fecha: date,
            ...groupedByDate[date],
        }));
    };

    // Preparar datos para gráfico de evolución histórica
    const prepareHistoricalData = () => {
        if (measurements.length === 0) return [];

        // Agrupar mediciones por fecha
        const groupedByDate = {};
        measurements.forEach((m) => {
            const fechaStr = new Date(m.fecha_muestra).toLocaleDateString();

            if (!groupedByDate[fechaStr]) {
                groupedByDate[fechaStr] = {
                    fecha: fechaStr,
                    SO2: null,
                    PM10: null,
                };
            }

            // Guardar valor máximo para cada parámetro por fecha
            if (m.parametro === "SO2") {
                const valor = parseNumberWithLocale(m.concentracion);
                groupedByDate[fechaStr].SO2 = Math.max(groupedByDate[fechaStr].SO2 || 0, valor);
            } else if (m.parametro === "PM10") {
                const valor = parseNumberWithLocale(m.concentracion);
                groupedByDate[fechaStr].PM10 = Math.max(groupedByDate[fechaStr].PM10 || 0, valor);
            }
        });

        // Convertir a array y ordenar por fecha
        return Object.values(groupedByDate)
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
            .slice(0, 10); // Mostrar solo las 10 fechas más recientes
    };

    const [activeTab, setActiveTab] = useState("maximum");

    return (
        <div className="flex flex-col gap-y-4 bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">Dashboard</h1>

            {/* Reemplazar la tarjeta de bienvenida por un header corporativo */}
            <div className="mb-6">
                <div className="relative mb-4 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white shadow-lg">
                    <div className="relative z-10">
                        <div className="flex items-center">
                            {/* Aquí podrías agregar un logo */}
                            <div className="mr-4">
                                {user?.empresa_logo ? (
                                    <img
                                        src={user.empresa_logo}
                                        alt="Logo"
                                        className="h-12 w-12 rounded-lg"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 font-bold">
                                        {userDisplay?.empresa?.charAt(0) || "E"}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">
                                    Bienvenido, {userDisplay?.nombre || user?.nombre || (user?.rol === "administrador" ? "Administrador" : "Usuario")}
                                </h2>
                                <p className="mt-2 text-sm opacity-90">
                                    {user?.rol === "cliente"
                                        ? `Panel de control para ${userDisplay?.empresa || user?.empresa || "su empresa"}`
                                        : "Aquí encontrarás un resumen de la información más relevante"}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <div className="rounded-md bg-white/15 px-3 py-1 text-sm backdrop-blur-sm">
                                Última actualización: {new Date().toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 right-0 h-40 w-40 translate-x-8 translate-y-8 rounded-full bg-white/10"></div>
                    <div className="absolute right-32 top-10 h-16 w-16 rounded-full bg-white/10"></div>
                </div>
            </div>

            {/* Añade el WeatherCard aquí, justo antes de tus indicadores principales */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Weather Card - Nuevo componente */}
                <WeatherCard /> {/* Sin pasar userId */}
                {/* También puedes moverlo a la tarjeta de indicadores si prefieres */}
            </div>

            {/* Indicadores principales */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Indicadores principales */}
                {renderIndicatorCards()}
            </div>

            {/* Gráficos principales */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Gráfica de barras */}
                <div className="card">
                    <div className="card-header">
                        <p className="card-title">Tendencias de Calidad del Aire</p>
                    </div>
                    <div className="card-body p-0">
                        {measurements.length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height={250}
                            >
                                <BarChart
                                    data={isMobile ? prepareChartData().filter((_, i) => i % 2 === 0) : prepareChartData()}
                                    margin={{ top: 20, right: 30, left: 20, bottom: isMobile ? 50 : 40 }}
                                    className="corporate-chart"
                                >
                                    <defs>
                                        <linearGradient
                                            id="colorValor"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#3b82f6"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#3b82f6"
                                                stopOpacity={0.2}
                                            />
                                        </linearGradient>
                                        <linearGradient
                                            id="colorLimite"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="#ef4444"
                                                stopOpacity={0.2}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke={theme === "light" ? "#e2e8f0" : "#334155"}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        strokeWidth={0}
                                        stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                        tickMargin={6}
                                        angle={isMobile ? -45 : 0}
                                        height={isMobile ? 60 : 30}
                                        textAnchor={isMobile ? "end" : "middle"}
                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                    />
                                    <YAxis
                                        strokeWidth={0}
                                        stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                        tickMargin={6}
                                        width={isMobile ? 35 : 45}
                                        tickCount={isMobile ? 4 : 6}
                                    />
                                    <Tooltip
                                        cursor={{ strokeDasharray: "3 3" }}
                                        contentStyle={{
                                            backgroundColor: theme === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(30, 41, 59, 0.95)",
                                            borderRadius: "8px",
                                            border: theme === "light" ? "1px solid #e2e8f0" : "1px solid #334155",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                            padding: "10px 14px",
                                        }}
                                    />
                                    <Legend
                                        wrapperStyle={{ paddingTop: "10px" }}
                                        iconType="circle"
                                    />
                                    <Bar
                                        dataKey="Valor"
                                        name="Concentración"
                                        fill="url(#colorValor)"
                                        isAnimationActive={false}
                                        radius={[4, 4, 0, 0]}
                                        shape={(props) => {
                                            // Extraer propiedades
                                            const { x, y, width, height, fill, radius, index, payload } = props;

                                            // Crear clave única con más información para evitar colisiones
                                            const uniqueKey = `valor-${index}-${payload?.name}-${Math.random().toString(36).substring(2, 9)}`;

                                            return (
                                                <rect
                                                    key={uniqueKey}
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height}
                                                    fill={fill}
                                                    rx={(radius && radius[0]) || 0}
                                                    ry={(radius && radius[0]) || 0}
                                                />
                                            );
                                        }}
                                    />

                                    <Bar
                                        dataKey="Límite"
                                        name="Límite Permitido"
                                        fill="url(#colorLimite)"
                                        isAnimationActive={false}
                                        radius={[4, 4, 0, 0]}
                                        shape={(props) => {
                                            // Extraer propiedades
                                            const { x, y, width, height, fill, radius, index, payload } = props;

                                            // Crear clave única con más información para evitar colisiones
                                            const uniqueKey = `limite-${index}-${payload?.name}-${Math.random().toString(36).substring(2, 9)}`;

                                            return (
                                                <rect
                                                    key={uniqueKey}
                                                    x={x}
                                                    y={y}
                                                    width={width}
                                                    height={height}
                                                    fill={fill}
                                                    rx={(radius && radius[0]) || 0}
                                                    ry={(radius && radius[0]) || 0}
                                                />
                                            );
                                        }}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-[250px] items-center justify-center">
                                <p className="text-gray-500">No hay suficientes datos para mostrar tendencias</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfica de pastel */}
                <div className="card">
                    <div className="card-header">
                        <p className="card-title">Distribución de Contaminantes</p>
                    </div>
                    <div className="card-body h-[250px] p-0">
                        {prepareParametersData().length > 0 ? (
                            <ResponsiveContainer
                                width="100%"
                                height="100%"
                            >
                                <PieChart>
                                    <defs>
                                        {COLORS.map((color, index) => (
                                            <linearGradient
                                                key={`gradient-${index}`}
                                                id={`colorGradient-${index}`}
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={color}
                                                    stopOpacity={1}
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={lightenColor(color)}
                                                    stopOpacity={0.8}
                                                />
                                            </linearGradient>
                                        ))}
                                    </defs>
                                    <Pie
                                        data={prepareParametersData()}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                                        outerRadius={isMobile ? 70 : 90}
                                        innerRadius={isMobile ? 40 : 60}
                                        fill="#8884d8"
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {prepareParametersData().map((entry, index) => (
                                            <Cell
                                                key={`cell-${entry.name}`}
                                                fill={`url(#colorGradient-${index % COLORS.length})`}
                                                stroke={theme === "light" ? "#fff" : "#1e293b"}
                                                strokeWidth={2}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            const item = props.payload;
                                            return [
                                                <div className="corporate-tooltip">
                                                    <div
                                                        className="tooltip-header"
                                                        style={{ fontWeight: "bold", marginBottom: "5px" }}
                                                    >
                                                        {item.name}
                                                    </div>
                                                    <div>
                                                        <strong>Porcentaje:</strong> {item.percentage}%
                                                    </div>
                                                    <div>
                                                        <strong>Valor promedio:</strong> {item.avg} {item.unit}
                                                    </div>
                                                    <div>
                                                        <strong>Máximo:</strong> {item.max} {item.unit}
                                                    </div>
                                                </div>,
                                                null,
                                            ];
                                        }}
                                        contentStyle={{
                                            backgroundColor: theme === "light" ? "rgba(255, 255, 255, 0.95)" : "rgba(30, 41, 59, 0.95)",
                                            borderRadius: "8px",
                                            border: theme === "light" ? "1px solid #e2e8f0" : "1px solid #334155",
                                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                                        }}
                                    />
                                    <Legend
                                        layout="horizontal"
                                        verticalAlign="bottom"
                                        align="center"
                                        formatter={(value, entry) => (
                                            <span style={{ color: theme === "light" ? "#334155" : "#94a3b8" }}>
                                                {value} ({prepareParametersData().find((i) => i.name === value)?.percentage}%)
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <p className="text-gray-500">No hay datos de distribución disponibles</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-header border-b-0 pb-0">
                    <div className="flex border-b">
                        <button
                            className={`px-4 py-2 ${activeTab === "maximum" ? "border-b-2 border-blue-500 font-medium text-blue-600" : "text-slate-500"}`}
                            onClick={() => setActiveTab("maximum")}
                        >
                            Mediciones Máximas
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === "evolution" ? "border-b-2 border-blue-500 font-medium text-blue-600" : "text-slate-500"}`}
                            onClick={() => setActiveTab("evolution")}
                        >
                            Evolución Histórica
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {activeTab === "maximum" ? (
                        // Contenido de Mediciones Máximas
                        <div className="max-h-[400px] overflow-auto">
                            <div className="card overflow-hidden">
                                <div className="card-header flex items-center justify-between">
                                    <p className="card-title flex items-center">
                                        <BarChart2 className="mr-2 h-5 w-5 text-blue-500" />
                                        Mediciones Máximas por Parámetro
                                    </p>
                                    <div className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        {getMaxMeasurementsByParameter().length} parámetros
                                    </div>
                                </div>
                                <div className="overflow-hidden">
                                    {getMaxMeasurementsByParameter().length > 0 ? (
                                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {getMaxMeasurementsByParameter().map((item, index) => {
                                                const percent = Math.round((parseNumberWithLocale(item.concentracion) / item.limite) * 100);
                                                const isHigh = percent > 80;

                                                return (
                                                    <div
                                                        key={index}
                                                        className="group p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <div
                                                                    className={`mr-3 rounded-md p-2 ${
                                                                        isHigh
                                                                            ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                                                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                                                    }`}
                                                                >
                                                                    {isHigh ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-slate-900 dark:text-slate-100">{item.parametro}</p>
                                                                    <p className="text-sm text-slate-500">
                                                                        {new Date(item.fecha).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-lg font-bold">
                                                                    {parseNumberWithLocale(item.concentracion).toFixed(2)}
                                                                    <span className="ml-1 text-xs font-normal text-slate-500">{item.unidad}</span>
                                                                </p>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <div className="h-1.5 w-16 rounded-full bg-slate-200 dark:bg-slate-700">
                                                                        <div
                                                                            className={`h-full rounded-full ${isHigh ? "bg-amber-500" : "bg-green-500"}`}
                                                                            style={{ width: `${Math.min(100, percent)}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span
                                                                        className={`text-xs font-medium ${
                                                                            isHigh
                                                                                ? "text-amber-800 dark:text-amber-400"
                                                                                : "text-green-800 dark:text-green-400"
                                                                        }`}
                                                                    >
                                                                        {percent}%
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex h-40 items-center justify-center">
                                            <p className="text-slate-500">No hay datos de mediciones disponibles</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Contenido de Evolución Histórica
                        <div className="h-[400px]">
                            <div className="card mt-4">
                                <div className="card-header">
                                    <p className="card-title">Evolución Histórica por Parámetro</p>
                                </div>
                                <div className="card-body p-0">
                                    {prepareHistoricalData().length > 0 ? (
                                        <div
                                            className="w-full"
                                            style={{ height: isMobile ? "300px" : "min(70vh, 400px)" }}
                                        >
                                            <ResponsiveContainer
                                                width="100%"
                                                height="100%"
                                            >
                                                <LineChart
                                                    data={isMobile ? prepareHistoricalData().filter((_, i) => i % 3 === 0) : prepareHistoricalData()}
                                                    margin={{ top: 20, right: 10, bottom: 40, left: 10 }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis
                                                        dataKey="fecha"
                                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                                        angle={isMobile ? -45 : 0}
                                                        textAnchor={isMobile ? "end" : "middle"}
                                                        height={isMobile ? 60 : 30}
                                                    />
                                                    <YAxis
                                                        tick={{ fontSize: isMobile ? 10 : 12 }}
                                                        width={isMobile ? 30 : 40}
                                                        tickCount={isMobile ? 3 : 5}
                                                    />
                                                    <Tooltip
                                                        cursor={{ strokeDasharray: "3 3" }}
                                                        wrapperStyle={{
                                                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                                                            padding: isMobile ? "15px" : "10px",
                                                            border: "1px solid #ccc",
                                                            borderRadius: "5px",
                                                            fontSize: isMobile ? "14px" : "12px",
                                                        }}
                                                    />
                                                    <Legend />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="SO2"
                                                        stroke="#3b82f6"
                                                        strokeWidth={2}
                                                        dot={{ r: 3 }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="PM10"
                                                        stroke="#ef4444"
                                                        strokeWidth={2}
                                                        dot={{ r: 3 }}
                                                        activeDot={{ r: 6 }}
                                                    />
                                                    {parametersLimits &&
                                                        Object.entries(parametersLimits).map(([param, { limit, unit }]) => (
                                                            <ReferenceLine
                                                                key={`limit-${param}`}
                                                                y={limit}
                                                                stroke={COLORS_MAP[param] || "#ef4444"}
                                                                strokeDasharray="3 3"
                                                                label={{
                                                                    position: "top",
                                                                    value: `Límite ${param}`,
                                                                    fill:
                                                                        theme === "light"
                                                                            ? COLORS_MAP[param]
                                                                            : lightenColor(COLORS_MAP[param] || "#ef4444"),
                                                                }}
                                                            />
                                                        ))}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <div className="flex h-[200px] items-center justify-center">
                                            <p className="text-gray-500">No hay suficientes datos históricos para este cliente</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                <p>Última actualización: {new Date().toLocaleString()}</p>
            </div>

            <Footer />
        </div>
    );
};

export default DashboardPage;
