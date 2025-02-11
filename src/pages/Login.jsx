import React, { useState } from "react";
import { ArrowRightIcon } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const Login = () => {
    const [nit, setNit] = useState("");
    const [password, setPassword] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "nit") {
            setNit(value);
        } else if (name === "password") {
            setPassword(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Accede a la variable de entorno correctamente
            const API_URL = process.env.REACT_APP_API_URL;

            if (!API_URL) {
                throw new Error("La URL del backend no está definida.");
            }

            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ nit, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Credenciales incorrectas");
            }

            const data = await response.json();
            console.log("Inicio de sesión exitoso:", data);

            localStorage.setItem("token", data.token);
            window.location.href = "/dashboard";
        } catch (error) {
            console.error("Error al iniciar sesión:", error.message);

            if (error.message === "La URL del backend no está definida.") {
                alert("Error de configuración: La URL del backend no está definida.");
            } else if (error.message.includes("Failed to fetch")) {
                alert("No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.");
            } else {
                alert(error.message || "Credenciales incorrectas o error del servidor.");
            }
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white">Iniciar Sesión</h2>
            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                {/* Campo NIT */}
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
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        required
                    />
                </div>

                {/* Campo Contraseña */}
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
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        required
                    />
                </div>

                {/* Botón de Inicio de Sesión */}
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                    Iniciar Sesión <ArrowRightIcon className="ml-2 h-5 w-5" />
                </button>

                {/* Enlaces adicionales */}
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <a
                        href="/forgot-password"
                        className="hover:text-indigo-500"
                    >
                        ¿Olvidaste tu contraseña?
                    </a>
                    <a
                        href="/register"
                        className="hover:text-indigo-500"
                    >
                        Registrarse
                    </a>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Login;
