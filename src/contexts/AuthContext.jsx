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
                        // Para el resto de usuarios, obtener el rol desde MySQL
                        // Aquí puedes llamar a tu API para obtener el rol
                        // O simplemente usar login como ya lo tienes implementado
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

            // Guardar el token
            localStorage.setItem("token", token);

            // ELIMINAR consulta a backend y usar SOLO los datos de Supabase
            // Asignar rol de administrador al usuario específico
            if (userData.email === "900900900@ejemplo.com") {
                const userWithRole = {
                    ...userData,
                    rol: "administrador",
                };
                console.log("👑 Usuario con rol administrador:", userWithRole);
                setUser(userWithRole);
            } else {
                // Para usuarios normales, asignar rol cliente
                const userWithRole = {
                    ...userData,
                    rol: "cliente",
                };
                console.log("👤 Usuario con rol cliente:", userWithRole);
                setUser(userWithRole);
            }
        } catch (error) {
            console.error("❌ Error en login:", error);
            setUser(userData); // Usar datos básicos en caso de error
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
