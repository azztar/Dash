// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { LockIcon } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { useParams } from "react-router-dom";

const ResetPassword = () => {
    const { token } = useParams();
    const [newPassword, setNewPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Lógica para restablecer contraseña
        console.log("Restablecer contraseña:", { token, newPassword });
    };

    return (
        <AuthLayout>
            <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white">Restablecer Contraseña</h2>
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor="newPassword"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Nueva Contraseña
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    Restablecer Contraseña <LockIcon className="ml-2 h-5 w-5" />
                </button>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <a
                        href="/login"
                        className="hover:text-indigo-500"
                    >
                        Volver al inicio de sesión
                    </a>
                </div>
            </form>
        </AuthLayout>
    );
};

export default ResetPassword;
