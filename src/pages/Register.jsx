// src/pages/Register.jsx
import React, { useState } from "react";
import { UserPlusIcon } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const Register = () => {
    const [nit, setNit] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Lógica para registrar usuario
        console.log("Registrar usuario:", { nit, email, password });
    };

    return (
        <AuthLayout>
            <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white">Registro</h2>
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
                        value={nit}
                        onChange={(e) => setNit(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        required
                    />
                </div>
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                    Registrarse <UserPlusIcon className="ml-2 h-5 w-5" />
                </button>
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                    <a
                        href="/login"
                        className="hover:text-indigo-500"
                    >
                        ¿Ya tienes una cuenta? Inicia sesión
                    </a>
                </div>
            </form>
        </AuthLayout>
    );
};

export default Register;
