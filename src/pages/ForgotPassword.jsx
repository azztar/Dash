// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { MailIcon } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Lógica para enviar correo de recuperación
        console.log("Recuperar contraseña:", { email });
    };

    return (
        <AuthLayout>
            <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white">Recuperar Contraseña</h2>
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Correo Electrónico
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Enviar Correo <MailIcon className="ml-2 h-5 w-5" />
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

export default ForgotPassword;
