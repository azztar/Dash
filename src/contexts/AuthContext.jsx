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
            console.log("⏳ Verificando token...", token ? "Token existe" : "No hay token");

            if (token) {
                try {
                    console.log("🔑 Enviando token:", token.substring(0, 10) + "...");

                    const response = await fetch("/api/auth/verify", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    const data = await response.json();
                    console.log("✅ Respuesta de verificación:", data);

                    if (data.success) {
                        setUser(data.user);
                        // Guardar usuario en localStorage para persistencia
                        localStorage.setItem("user_data", JSON.stringify(data.user));
                        console.log("👤 Usuario autenticado:", data.user?.nombre || data.user?.email);
                    } else {
                        console.warn("❌ Verificación fallida:", data.message);
                        handleLogout();
                    }
                } catch (error) {
                    console.error("🚫 Error verificando autenticación:", error);
                    // No cerrar sesión automáticamente en caso de error de red
                    if (error.name !== "TypeError" && error.name !== "NetworkError") {
                        handleLogout();
                    }
                }
            } else {
                // Intenta recuperar usuario del localStorage como fallback
                const cachedUser = localStorage.getItem("user_data");
                if (cachedUser) {
                    try {
                        const parsedUser = JSON.parse(cachedUser);
                        console.log("📋 Usando usuario en caché:", parsedUser?.nombre || parsedUser?.email);
                        setUser(parsedUser);

                        // Opcional: Si tienes un token en localStorage pero no en el estado
                        const localToken = localStorage.getItem("token");
                        if (localToken && !token) {
                            setToken(localToken);
                        }
                    } catch (e) {
                        console.error("Error parseando usuario en caché:", e);
                    }
                }
            }

            // Importante: siempre cambiar el estado de carga al finalizar
            setLoading(false);
            console.log("🔄 Verificación de auth completada");
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
                loading, // Añadir esta propiedad
                login: handleLogin,
                logout: handleLogout,
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
