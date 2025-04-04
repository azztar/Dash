import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRightIcon } from "@heroicons/react/24/solid";
import AuthLayout from "@/components/AuthLayout";
import { supabase } from "@/lib/supabase"; // Importa supabase

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [nit, setNit] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            console.log("Intentando login con Supabase. NIT:", nit);
            // Transformar NIT a formato email para Supabase
            const email = `${nit}@ejemplo.com`;

            // Usar directamente Supabase en lugar de fetch a /api/auth/login
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log("Respuesta de Supabase:", data, error);

            if (error) throw error;

            // Al recibir datos de usuario correctos
            if (data.user) {
                login(data.session.access_token, data.user);
                const from = location.state?.from?.pathname || "/dashboard";
                navigate(from, { replace: true });
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            setError("Credenciales incorrectas");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white">Iniciar Sesión</h2>

            {error && <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-500">{error}</div>}

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label
                        htmlFor="nit"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        NIT
                    </label>
                    <input
                        type="text"
                        id="nit"
                        name="nit"
                        value={nit}
                        onChange={(e) => setNit(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Contraseña
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Iniciando..." : "Iniciar Sesión"} <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>
                {/*
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <a
                        href="/forgot-password"
                        className="hover:text-indigo-500"
                    >
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>

                */}
            </form>
        </AuthLayout>
    );
};

export default Login;
