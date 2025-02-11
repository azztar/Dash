// src/components/AuthLayout.jsx
import React from "react";

const AuthLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
            {/* Espacio para el logotipo */}
            <div className="mb-8">
                <img
                    src="/src/assets/logo.png" // Ruta al logotipo
                    alt="ICC Logo"
                    className="h-auto w-32" // Tamaño del logotipo (ajusta según necesites)
                />
            </div>

            {/* Contenido principal */}
            <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">{children}</div>
        </div>
    );
};

export default AuthLayout;
