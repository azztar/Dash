// src/components/LoginButton.jsx
import React from "react";

const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = "http://localhost:5000/auth/google"; // Redirige al backend
    };

    return (
        <button
            onClick={handleLogin}
            className="rounded-md bg-red-500 px-4 py-2 text-white"
        >
            Iniciar sesión con Google
        </button>
    );
};

export default LoginButton;
