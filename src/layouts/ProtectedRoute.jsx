// src/layouts/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "@/hooks/use-auth";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    console.log("Estado de autenticación:", { user, loading });

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return children;
};

export default ProtectedRoute;
