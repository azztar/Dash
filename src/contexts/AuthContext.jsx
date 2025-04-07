import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    // Añadir un ref para evitar múltiples llamadas
    const initialCheckDone = useRef(false);

    // Verificar sesión al cargar
    useEffect(() => {
        // Solo ejecutar una vez
        if (initialCheckDone.current) return;

        const checkSession = async () => {
            try {
                const { data } = await supabase.auth.getSession();
                if (data.session) {
                    // Establecer rol directo para usuario de prueba
                    if (data.session.user.email === "900900900@ejemplo.com") {
                        const userWithRole = {
                            ...data.session.user,
                            rol: "administrador", // Forzar el rol de administrador
                        };
                        setUser(userWithRole);
                    } else {
                        setUser(data.session.user);
                    }
                }
            } catch (error) {
                console.error("Error verificando sesión:", error);
            } finally {
                setLoading(false);
                initialCheckDone.current = true;
            }
        };

        checkSession();

        // Suscribirse a cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (session) {
                setUser(session.user);
            } else {
                setUser(null);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Función de login que usa Supabase
    const login = async (token, userData) => {
        try {
            console.log("🔑 Token recibido:", token ? "Presente" : "Ausente");

            // Guardar el token primero para que esté disponible para la siguiente solicitud
            localStorage.setItem("token", token);

            const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

            // Consultar información completa del usuario desde MySQL
            const response = await axios.get(`${API_URL}/api/auth/user-info`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("📊 Datos de usuario MySQL:", response.data);

            // Combinar información de Supabase con MySQL, priorizando MySQL para el rol
            const userWithRole = {
                ...userData,
                ...response.data.user,
                rol: response.data.user.rol, // Usar explícitamente el rol de MySQL
            };

            console.log("👑 Usuario final con rol:", userWithRole);

            // Guardar el usuario completo en el estado
            setUser(userWithRole);
        } catch (error) {
            console.error("❌ Error al obtener información del usuario:", error);
            // Si falla, al menos guardar los datos básicos de Supabase
            setUser(userData);
        }
    };

    // Función de logout
    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
