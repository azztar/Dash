// src/routes/SettingsPage/page.jsx
import React, { useState } from "react";
import { Card } from "@tremor/react";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import { ToggleLeft, ToggleRight, Bell, User } from "lucide-react";

const SettingsPage = () => {
    const { theme, toggleTheme } = useTheme();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

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

                {/* Configuración del perfil */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-x-4">
                        <User
                            size={24}
                            className="text-slate-900 dark:text-white"
                        />
                        <span className="text-lg font-medium text-slate-900 dark:text-white">Perfil</span>
                    </div>
                    <button
                        onClick={() => alert("Editar perfil")}
                        className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700 sm:w-auto"
                    >
                        Editar
                    </button>
                </div>
            </Card>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default SettingsPage;
