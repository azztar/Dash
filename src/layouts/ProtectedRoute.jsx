// src/layouts/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    // Paso crítico: Esperar a que termine la verificación de autenticación
    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-slate-900">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    // Si no hay usuario autenticado después de terminar la carga, redirigir al login
    if (!user) {
        console.log("⚠️ ProtectedRoute: No hay usuario autenticado, redirigiendo al login");
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // Si se especifican roles permitidos, verificar que el usuario tenga uno de ellos
    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.rol)) {
        console.log(`⚠️ ProtectedRoute: Usuario no tiene rol permitido (${user?.rol}), redirigiendo`);
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }

    // El usuario está autenticado y tiene permiso
    console.log("✅ ProtectedRoute: Usuario autenticado con acceso permitido");
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
