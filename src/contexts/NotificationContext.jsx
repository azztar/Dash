import React, { createContext, useContext, useState, useEffect } from "react";
import { Bell, FileText, AlertCircle } from "lucide-react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Cargar notificaciones guardadas
    useEffect(() => {
        try {
            const saved = localStorage.getItem("notifications");
            if (saved) {
                setNotifications(JSON.parse(saved));
            }
        } catch (error) {
            console.error("Error al cargar notificaciones:", error);
        }
    }, []);

    // Guardar notificaciones cuando cambien
    useEffect(() => {
        try {
            localStorage.setItem("notifications", JSON.stringify(notifications));
        } catch (error) {
            console.error("Error al guardar notificaciones:", error);
        }
    }, [notifications]);

    // Generar notificaciones basadas en datos SIN useNavigate
    const generateNotifications = (files = [], measurements = []) => {
        const newNotifications = [];

        // Notificación de archivos recientes (últimos 7 días)
        const recentFiles = files.filter((file) => {
            const fileDate = new Date(file.fecha_carga);
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return fileDate >= sevenDaysAgo;
        });

        if (recentFiles.length > 0) {
            newNotifications.push({
                id: "recent-files",
                title: `${recentFiles.length} archivo(s) nuevo(s)`,
                description: `Tienes ${recentFiles.length} archivo(s) subido(s) en la última semana`,
                icon: <FileText className="h-5 w-5 text-blue-500" />,
                action: () => (window.location.href = "/archivos"), // No usar navigate
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
                newNotifications.push({
                    id: "high-measurements",
                    title: `Alerta: Mediciones cercanas al límite`,
                    description: `${highMeasurements.length} medición(es) están por encima del 80% del límite permitido`,
                    icon: <AlertCircle className="h-5 w-5 text-amber-500" />,
                    action: () => (window.location.href = "/mediciones"), // No usar navigate
                    type: "warning",
                });
            }
        }

        // Añadir notificación de bienvenida si no hay otras
        if (newNotifications.length === 0) {
            newNotifications.push({
                id: "welcome",
                title: "Bienvenido al dashboard",
                description: "Aquí verás un resumen de tu actividad y datos importantes",
                icon: <Bell className="h-5 w-5 text-blue-500" />,
                action: () => (window.location.href = "/dashboard"), // No usar navigate
                type: "info",
            });
        }

        setNotifications(newNotifications);
        return newNotifications;
    };

    // Agregar una notificación
    const addNotification = (notification) => {
        setNotifications((prev) => [...prev, { ...notification, id: notification.id || Date.now().toString() }]);
    };

    // Eliminar una notificación
    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    };

    // Limpiar todas las notificaciones
    const clearNotifications = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                generateNotifications,
                addNotification,
                removeNotification,
                clearNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);
