// src/routes/SettingsPage/page.jsx
import React, { useState } from "react";
import { Card } from "@tremor/react";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import { ToggleLeft, ToggleRight, Bell, User, BarChart2, Lock } from "lucide-react";

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [compactView, setCompactView] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [reportNotifications, setReportNotifications] = useState(true);
    const [defaultChartType, setDefaultChartType] = useState("bar");
    const [refreshInterval, setRefreshInterval] = useState("0");

    return (
        <div className={`min-h-screen p-6 transition-colors ${theme === "light" ? "bg-slate-100" : "bg-slate-950"}`}>
            {/* Título de la página */}
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Configuración</h1>

            {/* Tarjeta principal */}
            <Card className="mt-6 h-full w-full bg-white p-6 shadow-md dark:bg-gray-900">
                {/* Configuración del tema */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-x-4">
                        {theme === "light" ? (
                            <ToggleLeft size={24} />
                        ) : (
                            <ToggleRight
                                size={24}
                                className="text-slate-900 dark:text-white"
                            />
                        )}
                        <span className="text-lg font-medium text-slate-900 dark:text-white">Tema Oscuro</span>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 sm:w-auto"
                    >
                        {theme === "light" ? "Activar" : "Desactivar"}
                    </button>
                </div>

                {/* Configuración de notificaciones */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-x-4">
                        <Bell
                            size={24}
                            className="text-slate-900 dark:text-white"
                        />
                        <span className="text-lg font-medium text-slate-900 dark:text-white">Notificaciones</span>
                    </div>
                    <button
                        onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                        className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 sm:w-auto"
                    >
                        {notificationsEnabled ? "Desactivar" : "Activar"}
                    </button>
                </div>

                {/* Preferencias de visualización */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-x-4">
                        <BarChart2
                            size={24}
                            className="text-slate-900 dark:text-white"
                        />
                        <span className="text-lg font-medium text-slate-900 dark:text-white">Vista compacta del dashboard</span>
                    </div>
                    <button
                        onClick={() => setCompactView(!compactView)}
                        className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 sm:w-auto"
                    >
                        {compactView ? "Desactivar" : "Activar"}
                    </button>
                </div>

                {/* Opciones de visualización del dashboard */}
                <div className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-700">
                    <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">Personalización del Dashboard</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-700 dark:text-gray-300">Mostrar gráficos por defecto</label>
                            <select
                                className="rounded border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                value={defaultChartType}
                                onChange={(e) => setDefaultChartType(e.target.value)}
                            >
                                <option value="bar">Barras</option>
                                <option value="line">Líneas</option>
                                <option value="area">Área</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="text-sm text-gray-700 dark:text-gray-300">Intervalo de actualización</label>
                            <select
                                className="rounded border border-gray-300 bg-white p-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(e.target.value)}
                            >
                                <option value="0">Manual</option>
                                <option value="60">Cada minuto</option>
                                <option value="300">Cada 5 minutos</option>
                                <option value="1800">Cada 30 minutos</option>
                                <option value="3600">Cada hora</option>
                            </select>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default SettingsPage;
