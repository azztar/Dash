// src/routes/AirePage/page.jsx
import React, { useState, useEffect, Fragment } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"; // Importar componentes de Recharts
import { Card } from "@tremor/react"; // Importar componentes de Tremor
import { Dialog, Transition } from "@headlessui/react"; // Modal personalizado
import { useTheme } from "@/hooks/use-theme"; // Hook para manejar el tema
import { Footer } from "@/layouts/footer"; // Pie de página
import { useAuth } from "@/hooks/use-auth";
import { airQualityService } from "@/services/airQualityService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Paso 1: Definir el componente principal
const AirePage = () => {
    const { theme } = useTheme();
    const { user } = useAuth();

    // ----- ESTADOS -----
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Lista de estaciones, selección de estación y estado del modal
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Parámetro (norma) seleccionado
    const [selectedNorm, setSelectedNorm] = useState(null);

    // Fechas
    //  Si usas DatePicker de rango, necesitarás startDate y endDate
    //  Si usas DatePicker de solo mes/año, necesitarás selectedDate
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);

    // Datos mostrados en la tabla principal, la tabla de conformidad y el gráfico
    const [data, setData] = useState(null);

    // Mediciones disponibles (por ejemplo, para listarlas y seleccionar una)
    const [medicionesDisponibles, setMedicionesDisponibles] = useState([]);
    const [selectedMedicion, setSelectedMedicion] = useState(null);

    // ----- EFECTOS -----

    // Cargar estaciones al montar
    useEffect(() => {
        const loadData = async () => {
            try {
                const stationsData = await airQualityService.getStations();
                setStations(stationsData);
            } catch (error) {
                console.error("Error al cargar estaciones:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // ----- FUNCIONES DEL FLUJO -----

    // 1. Selección de norma (parámetro)
    const handleNormSelect = (norm) => {
        setSelectedNorm(norm);
        setIsModalOpen(true); // Abrir modal para seleccionar estación
    };

    // 2. Selección de estación
    const handleStationSelect = async (station) => {
        try {
            setLoading(true);
            setSelectedStation(station);
            setIsModalOpen(false);

            // Cargar mediciones de la estación (puedes filtrarlas luego por fecha)
            const mediciones = await airQualityService.getMediciones(station.id_estacion);
            setMedicionesDisponibles(mediciones);

            // Opcional: cargar fechas disponibles para esa estación y norma
            // Esto depende de tu backend. Ejemplo:
            // const dates = await airQualityService.getAvailableDates(station.id_estacion, selectedNorm);
            // setAvailableDates(dates);
        } catch (error) {
            console.error("Error:", error);
            setError("Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    // 3. Selección de fecha (mes/año).
    //    Si usas un DatePicker con showMonthYearPicker, capturas "date" y se lo pasas al backend
    const handleDateSelect = async (date) => {
        setSelectedDate(date);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (selectedStation && selectedNorm && date) {
            try {
                setLoading(true);
                const measurements = await airQualityService.getMeasurementsByDate(selectedStation.id_estacion, selectedNorm, date);
                setData(measurements);
            } catch (error) {
                console.error("Error:", error);
                setError("Error al cargar las mediciones");
            } finally {
                setLoading(false);
            }
        }
    };

    // 4. Visualización de datos (ejemplo de “rango de fechas” en lugar de mes/año)
    //    Si deseas un rango, usas “startDate” y “endDate”.
    const handleDateChange = async (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);

        if (start && end && selectedStation && selectedNorm) {
            try {
                setLoading(true);
                const measurements = await airQualityService.getMeasurements(selectedStation.id_estacion, selectedNorm, start, end);
                setData(measurements);
            } catch (error) {
                console.error("Error:", error);
                setError("Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        }
    };

    // Manejar la selección de una medición específica
    const handleMedicionSelect = (medicion) => {
        setSelectedMedicion(medicion);
        // Ejemplo: solo mostramos la medición seleccionada
        setData([medicion]);
    };

    // ----- RENDERIZADO DE PARTES (TABLAS, GRÁFICAS, ETC.) -----

    // Renderizado del selector de fechas (si usas mes/año o rango)
    const renderDateSelector = () => (
        <Card className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Seleccionar Período</h3>
            {/* Si solo quieres mes/año: */}
            {/*
            <DatePicker
                selected={selectedDate}
                onChange={handleDateSelect}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                className="w-full rounded-md border p-2"
                includeDates={availableDates}
                placeholderText="Seleccione Mes/Año"
            />
            */}

            {/* Si quieres rango de fechas: */}
            <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                className="w-full rounded-md border p-2"
                includeDates={availableDates}
                placeholderText="Seleccione un rango de fechas"
            />
        </Card>
    );

    // Tabla de declaraciones de conformidad
    const renderConformityTable = () => (
        <Card className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Declaración de Conformidad</h3>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="border p-2">Fecha</th>
                        <th className="border p-2">Valor Medido</th>
                        <th className="border p-2">Incertidumbre</th>
                        <th className="border p-2">Valor Límite</th>
                        <th className="border p-2">Conformidad</th>
                    </tr>
                </thead>
                <tbody>
                    {data &&
                        data.map((item, index) => {
                            const isConform = item.concentracion_pm10 + item.u_pm10_factor_cobertura < item.norma_pm10_24_horas;
                            return (
                                <tr
                                    key={index}
                                    className={isConform ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}
                                >
                                    <td className="border p-2">{new Date(item.fecha_hora_inicial).toLocaleDateString()}</td>
                                    <td className="border p-2">{item.concentracion_pm10}</td>
                                    <td className="border p-2">±{item.u_pm10_factor_cobertura}</td>
                                    <td className="border p-2">{item.norma_pm10_24_horas}</td>
                                    <td className="border p-2">{isConform ? "CONFORME" : "NO CONFORME"}</td>
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </Card>
    );

    // ----- RETURN PRINCIPAL -----
    return (
        <div className={`min-h-screen p-6 transition-colors ${theme === "light" ? "bg-slate-100" : "bg-slate-950"}`}>
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Calidad del Aire</h1>

            <Card className="mt-6 h-full w-full bg-white p-6 shadow-md dark:bg-gray-900">
                {/* Selección de parámetro (tarjetas) */}
                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {["PM10", "PM2.5", "SO2", "NO2", "O3", "CO"].map((norm) => (
                        <Card
                            key={norm}
                            onClick={() => handleNormSelect(norm)}
                            className={`cursor-pointer rounded-lg p-6 text-center shadow ${
                                selectedNorm === norm
                                    ? "bg-sky-500 text-white dark:bg-sky-600 dark:text-white"
                                    : "bg-white hover:bg-slate-200 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-700"
                            }`}
                        >
                            <span className="text-xl font-semibold">{norm}</span>
                        </Card>
                    ))}
                </div>

                {/* Selector de Fechas (rango o mes/año) solo si hay estación y norma */}
                {selectedStation && selectedNorm && renderDateSelector()}

                {/* Tabla de mediciones_aire + gráfico */}
                {data && (
                    <>
                        {/* Tabla mediciones_aire */}
                        <Card className="mt-6 h-full w-full bg-white p-6 shadow-md dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Datos de la estación: {selectedStation?.name}
                            </h2>
                            <table className="w-full border-collapse border border-gray-300 text-left dark:border-gray-600 dark:text-white">
                                <thead>
                                    <tr className="bg-slate-200 dark:bg-slate-800">
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">MUESTRA</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">FECHA Y HORA INICIAL</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">TIEMPO DEL MUESTREO (min)</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">CONCENTRACIÓN PM10 (µg/m³)</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">U (µg/m³)</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">U Factor Cobertura (k=2)</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">NORMA (µg/m³)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item, index) => (
                                        <tr
                                            key={index}
                                            className="odd:bg-slate-100 even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-800"
                                        >
                                            <td className="border border-slate-300 p-2 dark:border-slate-700">{item.muestra}</td>
                                            <td className="border border-slate-300 p-2 dark:border-slate-700">{item.fecha_hora_inicial}</td>
                                            <td className="border border-slate-300 p-2 dark:border-slate-700">{item.tiempo_muestreo_minutos}</td>
                                            <td className="border border-slate-300 p-2 dark:border-slate-700">{item.concentracion_pm10}</td>
                                            <td className="border border-slate-300 p-2 dark:border-slate-700">{item.u_pm10}</td>
                                            <td className="border border-slate-300 p-2 dark:border-slate-700">{item.u_pm10_factor_cobertura}</td>
                                            <td className="border border-slate-300 p-2 dark:border-slate-700">{item.norma_pm10_24_horas}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>

                        {/* Gráfico */}
                        <Card className="mt-6 h-full w-full bg-white p-6 shadow-md dark:bg-gray-900">
                            <h2 className="text-tremor-content dark:text-dark-tremor-content mb-4 text-lg font-semibold">
                                Concentración PM10 vs Fecha
                            </h2>
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
                                    <Tooltip formatter={(value) => `${value}`} />
                                    <ReferenceLine
                                        y={75}
                                        stroke="red"
                                        strokeDasharray="3 3"
                                        label="Norma PM10 (75 µg/m³)"
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

                        {/* Tabla de conformidad */}
                        {renderConformityTable()}
                    </>
                )}

                {/* Lista de mediciones disponibles para la estación seleccionada (si procede) */}
                {selectedStation && (
                    <div className="mt-6">
                        <h3 className="mb-4 text-lg font-semibold">Mediciones Disponibles</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {medicionesDisponibles.map((medicion) => (
                                <button
                                    key={medicion.id_medicion} // Asegúrate de que id_medicion sea único
                                    onClick={() => handleMedicionSelect(medicion)}
                                    className={`rounded-lg border p-4 ${
                                        selectedMedicion?.id_medicion === medicion.id_medicion ? "border-blue-500 bg-blue-100" : "hover:bg-gray-50"
                                    }`}
                                >
                                    <p className="font-medium">{medicion.fecha_formateada}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mostrar datos de la medición individual si se desea */}
                {selectedMedicion && data && <div className="mt-6">{/* Aquí puedes renderizar tableros, tablas adicionales, etc. */}</div>}
            </Card>

            {/* Modal: Selección de estación */}
            <Transition
                appear
                show={isModalOpen}
                as={Fragment}
            >
                <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => setIsModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-50"
                                    >
                                        Selecciona una estación:
                                    </Dialog.Title>
                                    <ul className="mt-4">
                                        {stations.map((station) => (
                                            <li
                                                key={station.id_estacion}
                                                className="cursor-pointer rounded-md p-2 text-gray-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-700"
                                                onClick={() => handleStationSelect(station)}
                                            >
                                                {station.nombre_estacion}
                                            </li>
                                        ))}
                                    </ul>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Footer */}
            <Footer />
        </div>
    );
};

// Componentes auxiliares
const StationCard = ({ station, onSelect }) => {
    return (
        <div
            className="card cursor-pointer p-4"
            onClick={() => onSelect(station)}
        >
            <h3 className="font-bold">{station.nombre_estacion}</h3>
            <p className="text-sm text-gray-600">{station.ubicacion}</p>
        </div>
    );
};

const StationDetails = ({ station, measurements }) => {
    return (
        <div className="card p-4">
            {/* ... mostrar detalles de la estación y/o mediciones ... */}
            <h3 className="text-lg font-bold">{station.nombre_estacion}</h3>
        </div>
    );
};

export default AirePage;
