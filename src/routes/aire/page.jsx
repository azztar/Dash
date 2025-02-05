// src/routes/AirePage/page.jsx
import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"; // Importar componentes de Recharts
import { Card } from "@tremor/react"; // Importar componentes de Tremor
import { Dialog, Transition } from "@headlessui/react"; // Modal personalizado
import { Fragment } from "react";
import { useTheme } from "@/hooks/use-theme"; // Hook para manejar el tema
import { Footer } from "@/layouts/footer"; // Pie de página

// Datos simulados de estaciones y mediciones
const stations = [
    { id: 1, name: "Estación Norte" },
    { id: 2, name: "Estación Sur" },
    { id: 3, name: "Estación Este" },
    { id: 4, name: "Estación Oeste" },
];

// Datos simulados de muestras (18 muestras)
const sampleData = [
    {
        muestra: "1.1",
        fecha_hora_inicial: "2024/10/18 8:47",
        tiempo_muestreo_minutos: 1441.2,
        concentracion_pm10: 28.63,
        u_pm10: 0.02,
        u_pm10_factor_cobertura: 0.03,
        norma_pm10_24_horas: 75.0,
    },
    {
        muestra: "1.2",
        fecha_hora_inicial: "2024/10/19 8:56",
        tiempo_muestreo_minutos: 1412.4,
        concentracion_pm10: 12.91,
        u_pm10: 0.02,
        u_pm10_factor_cobertura: 0.05,
        norma_pm10_24_horas: 75.0,
    },
    {
        muestra: "1.3",
        fecha_hora_inicial: "2024/10/20 8:37",
        tiempo_muestreo_minutos: 1438.2,
        concentracion_pm10: 14.53,
        u_pm10: 0.02,
        u_pm10_factor_cobertura: 0.04,
        norma_pm10_24_horas: 75.0,
    },
    // Agregar más muestras aquí...
];

const AirePage = () => {
    const { theme } = useTheme(); // Acceder al tema actual
    const [selectedNorm, setSelectedNorm] = useState(""); // Norma seleccionada
    const [selectedStation, setSelectedStation] = useState(null); // Estación seleccionada
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado del modal
    const [data, setData] = useState([]); // Datos filtrados

    // Manejar la selección de la norma
    const handleNormSelect = (norm) => {
        setSelectedNorm(norm);
        setIsModalOpen(true); // Abrir el modal para seleccionar la estación
    };

    // Manejar la selección de la estación
    const handleStationSelect = (station) => {
        setSelectedStation(station);
        setIsModalOpen(false); // Cerrar el modal

        // Filtrar los datos según la estación y la norma seleccionada
        const filteredData = sampleData.map((item) => ({
            ...item,
            fecha_hora_inicial: item.fecha_hora_inicial.split(" ")[0], // Solo la fecha para el gráfico
        }));
        setData(filteredData);
    };

    return (
        <div className={`min-h-screen p-6 transition-colors ${theme === "light" ? "bg-slate-100" : "bg-slate-950"}`}>
            {/* Título de la página */}
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Calidad del Aire</h1>

            {/* Tarjeta principal */}
            <Card className="mt-6 h-full w-full bg-white p-6 shadow-md dark:bg-gray-900">
                {/* Selector de norma mediante tarjetas */}
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

                {/* Mostrar los datos filtrados */}
                {data.length > 0 && (
                    <>
                        {/* Cuadro de datos estilo Excel */}
                        <Card className="mt-6 h-full w-full bg-white p-6 shadow-md dark:bg-gray-900">
                            <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Datos de la estación: {selectedStation?.name}
                            </h2>

                            <table className="w-full border-collapse border border-gray-300 text-left dark:border-gray-600 dark:text-white">
                                <thead>
                                    <tr className="bg-slate-200 dark:bg-slate-800">
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">MUESTRA</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">FECHA Y HORA INICIAL</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">TIEMPO DEL MUESTREO EN MINUTOS</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">CONCENTRACIÓN PM10 (µg/m³)</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">U PM10 (µg/m³)</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">U PM10 CON FACTOR DE COBERTURA (k=2)</th>
                                        <th className="border border-slate-300 p-2 dark:border-slate-700">NORMA PM10 24 HORAS (µg/m³)</th>
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

                        {/* Gráfico en una tarjeta */}
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
                    </>
                )}
            </Card>

            {/* Modal para seleccionar la estación */}
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
                                                key={station.id}
                                                className="cursor-pointer rounded-md p-2 text-gray-900 hover:bg-slate-200 dark:text-white dark:hover:bg-slate-700"
                                                onClick={() => handleStationSelect(station)}
                                            >
                                                {station.name}
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

export default AirePage;
