import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [loading, setLoading] = useState(true);

    // Añadir esta nueva función aquí
    const clearUserSpecificCache = (userId) => {
        // Guarda el ID del usuario actual en localStorage
        const currentCacheUser = localStorage.getItem("cache_user_id");

        // Si el usuario ha cambiado, limpia el caché específico
        if (currentCacheUser && currentCacheUser !== userId.toString()) {
            localStorage.removeItem("dashboard_measurements");
            localStorage.removeItem("dashboard_latestMeasurement");
            localStorage.removeItem("dashboard_files");
            localStorage.removeItem("dashboard_timestamp");
            console.log("Caché limpiado por cambio de usuario");
        }

        // Actualiza el ID del usuario actual
        localStorage.setItem("cache_user_id", userId.toString());
    };

    useEffect(() => {
        const verifyAuth = async () => {
            if (token) {
                try {
                    const response = await fetch("/api/auth/verify", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = await response.json();
                    if (data.success) {
                        setUser(data.user);
                    } else {
                        handleLogout();
                    }
                } catch (error) {
                    console.error("Error verificando autenticación:", error);
                    handleLogout();
                }
            }
            setLoading(false);
        };

        verifyAuth();
    }, [token]);

    const handleLogin = (newToken, userData) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("user_data", JSON.stringify(userData));

        // Añadir esta línea:
        if (userData && userData.id) {
            clearUserSpecificCache(userData.id);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login: handleLogin,
                logout: handleLogout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe ser usado dentro de un AuthProvider");
    }
    return context;
};
