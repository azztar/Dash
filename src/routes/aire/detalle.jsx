import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text } from "@tremor/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import { airQualityService } from "@/services/airQualityService";
import { useTheme } from "@/hooks/use-theme";
import { PageContainer } from "@/components/PageContainer";
import { useResponsive } from "@/hooks/useResponsive"; // Añadir esta línea

// Registrar el locale español
registerLocale("es", es);

const DetalleAire = () => {
    const { estacionId } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { isMobile } = useResponsive(); // Añadir esta línea
    const [dateRange, setDateRange] = useState([null, null]);
    const [startDate, endDate] = dateRange;
    const [mediciones, setMediciones] = useState([]);
    const [declaraciones, setDeclaraciones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!startDate || !endDate) return;

            setLoading(true);
            try {
                const [medicionesData, declaracionesData] = await Promise.all([
                    airQualityService.getMeasurements(estacionId, {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                    }),
                    airQualityService.getConformityDeclarations(estacionId, {
                        startDate: startDate.toISOString(),
                        endDate: endDate.toISOString(),
                    }),
                ]);

                setMediciones(medicionesData);
                setDeclaraciones(declaracionesData);
            } catch (error) {
                console.error("Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [estacionId, startDate, endDate]);

    return (
        <PageContainer>
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Informes</h1>
            <div className="space-y-6 p-6">
                <Card>
                    <div className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
                        <Title>Mediciones de PM10</Title>
                        <DatePicker
                            selectsRange={true}
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(update) => setDateRange(update)}
                            isClearable={true}
                            locale="es"
                            dateFormat="dd/MM/yyyy"
                            className="rounded-md border bg-white p-2 dark:bg-gray-800 dark:text-white"
                            placeholderText="Seleccione rango de fechas"
                        />
                    </div>
                </Card>

                {loading ? (
                    <div className="flex h-32 items-center justify-center">
                        <Text>Cargando datos...</Text>
                    </div>
                ) : (
                    <>
                        {mediciones.length === 0 ? (
                            <Text className="text-slate-500 dark:text-slate-400">No hay datos disponibles para el periodo seleccionado</Text>
                        ) : (
                            <>
                                <Card>
                                    <Title className="mb-4">Mediciones</Title>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-gray-800">
                                                <tr>
                                                    <th className="p-4 text-left">Fecha</th>
                                                    <th className="p-4 text-left">Concentración PM10</th>
                                                    <th className="p-4 text-left">Incertidumbre</th>
                                                    <th className="p-4 text-left">Factor de Cobertura</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mediciones.map((medicion) => (
                                                    <tr
                                                        key={medicion.id_medicion_aire}
                                                        className="border-t border-gray-200 dark:border-gray-700"
                                                    >
                                                        <td className="p-4">{new Date(medicion.fecha_hora_inicial).toLocaleDateString("es-ES")}</td>
                                                        <td className="p-4">{medicion.concentracion_pm10} µg/m³</td>
                                                        <td className="p-4">{medicion.u_pm10} µg/m³</td>
                                                        <td className="p-4">{medicion.u_pm10_factor_cobertura}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>

                                <Card>
                                    <Title className="mb-4">Gráfico de Tendencia</Title>
                                    <div
                                        className="w-full"
                                        style={{ height: isMobile ? "300px" : "min(70vh, 400px)" }}
                                    >
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <AreaChart
                                                data={isMobile && mediciones.length > 12 ? mediciones.filter((_, i) => i % 3 === 0) : mediciones}
                                                margin={{ top: 20, right: 15, left: 10, bottom: isMobile ? 50 : 30 }}
                                            >
                                                <XAxis
                                                    dataKey="fecha_hora_inicial"
                                                    tickFormatter={(date) => new Date(date).toLocaleDateString("es-ES")}
                                                    stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"}
                                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                                    angle={isMobile ? -45 : 0}
                                                    textAnchor={isMobile ? "end" : "middle"}
                                                    height={isMobile ? 50 : 30}
                                                />
                                                <YAxis
                                                    stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"}
                                                    tick={{ fontSize: isMobile ? 10 : 12 }}
                                                    width={isMobile ? 35 : 45}
                                                    tickCount={isMobile ? 4 : 6}
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
                                                <ReferenceLine
                                                    y={75}
                                                    stroke="#EF4444"
                                                    label={{
                                                        position: "top",
                                                        value: "Límite PM10",
                                                        fill: theme === "dark" ? "#FCA5A5" : "#EF4444",
                                                        fontSize: isMobile ? 10 : 12,
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="concentracion_pm10"
                                                    stroke="#3B82F6"
                                                    fill="#93C5FD"
                                                    isAnimationActive={false} // Añadir esta línea
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>
                            </>
                        )}
                    </>
                )}
            </div>
        </PageContainer>
    );
};

export default DetalleAire;
