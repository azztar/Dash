import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const login = async (nit, password) => {
        try {
            console.log("Intentando login con:", { nit, password }); // Para debuggear

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/auth/login`,
                {
                    nit,
                    password,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            console.log("Respuesta del servidor:", response.data); // Para debuggear

            if (response.data.success) {
                localStorage.setItem("token", response.data.token);
                setUser(response.data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Error detallado del login:", error.response?.data);
            console.error("Error en login:", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/validate-token`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                setUser(response.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Error al verificar autenticación:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        user,
        loading,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};
