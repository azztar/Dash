// src/layouts/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/use-auth";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>; // Muestra un spinner o mensaje de carga
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        ); // Redirige al login si no está autenticado
    }

    return <>{children}</>;
};

export default ProtectedRoute;
