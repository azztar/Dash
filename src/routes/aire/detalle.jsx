import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Title, Text } from "@tremor/react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import es from "date-fns/locale/es";
import { airQualityService } from "@/services/airQualityService";
import { useTheme } from "@/hooks/use-theme";

// Registrar el locale español
registerLocale("es", es);

const DetalleAire = () => {
    const { estacionId } = useParams();
    const navigate = useNavigate();
    const { theme } = useTheme();
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
                                <ResponsiveContainer
                                    width="100%"
                                    height={400}
                                >
                                    <AreaChart data={mediciones}>
                                        <XAxis
                                            dataKey="fecha_hora_inicial"
                                            tickFormatter={(date) => new Date(date).toLocaleDateString("es-ES")}
                                            stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"}
                                        />
                                        <YAxis stroke={theme === "dark" ? "#9CA3AF" : "#6B7280"} />
                                        <Tooltip />
                                        <ReferenceLine
                                            y={75}
                                            stroke="#EF4444"
                                            label="Límite PM10"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="concentracion_pm10"
                                            stroke="#3B82F6"
                                            fill="#93C5FD"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Card>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default DetalleAire;
