import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { authService } from "@/services/authService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const initialCheckDone = useRef(false);

    // Verificar sesión actual al cargar
    useEffect(() => {
        const checkSession = async () => {
            if (initialCheckDone.current) return;

            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.log("❌ No hay token guardado");
                    setLoading(false);
                    initialCheckDone.current = true;
                    return;
                }

                // Verificar token con backend
                const response = await authService.getProfile();

                if (response && response.user) {
                    setUser(response.user);
                    console.log("✅ Sesión verificada", response.user);
                }
            } catch (error) {
                console.error("Error verificando sesión:", error);
                localStorage.removeItem("token");
            } finally {
                setLoading(false);
                initialCheckDone.current = true;
            }
        };

        checkSession();
    }, []);

    // Función de login
    const login = async (token, userData) => {
        try {
            localStorage.setItem("token", token);
            setUser(userData);
            return true;
        } catch (error) {
            console.error("Error en login:", error);
            return false;
        }
    };

    // Función de logout
    const logout = async () => {
        try {
            await authService.logout();
            localStorage.removeItem("token");
            setUser(null);
            return true;
        } catch (error) {
            console.error("Error en logout:", error);
            return false;
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
