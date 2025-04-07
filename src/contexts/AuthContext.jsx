import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const initialCheckDone = useRef(false);

    // Función para preservar rol y guardarlo en localStorage
    const persistUserWithRole = (userData, rolValue) => {
        const userWithRole = {
            ...userData,
            rol: rolValue,
        };
        console.log(`📝 Guardando usuario con rol ${rolValue}:`, userWithRole);
        localStorage.setItem("user_with_role", JSON.stringify(userWithRole));
        setUser(userWithRole);
        return userWithRole;
    };

    // Verificar sesión al cargar
    useEffect(() => {
        if (initialCheckDone.current) return;

        const checkSession = async () => {
            try {
                // 1. Verificar sesión en Supabase
                const { data } = await supabase.auth.getSession();

                if (data.session) {
                    // 2. Obtener rol desde Supabase
                    const email = data.session.user.email;
                    const nit = email.split("@")[0];

                    const { data: userData, error } = await supabase.from("usuarios").select("rol, nombre_empresa").eq("nit", nit).single();

                    if (!error) {
                        persistUserWithRole(data.session.user, userData.rol);
                    } else {
                        // Si es el admin
                        if (email === "900900900@ejemplo.com") {
                            persistUserWithRole(data.session.user, "administrador");
                        } else {
                            persistUserWithRole(data.session.user, "cliente");
                        }
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
    }, []);

    // Función de login usando Supabase
    const login = async (token, userData) => {
        try {
            // Obtener rol desde Supabase
            const email = userData.email;
            const nit = email.split("@")[0];

            const { data: userProfile, error } = await supabase.from("usuarios").select("rol, nombre_empresa").eq("nit", nit).single();

            if (!error) {
                persistUserWithRole(userData, userProfile.rol);
            } else if (email === "900900900@ejemplo.com") {
                persistUserWithRole(userData, "administrador");
            } else {
                persistUserWithRole(userData, "cliente");
            }
        } catch (error) {
            console.error("Error al obtener rol:", error);
            // Si falla, asignar rol por defecto
            if (userData.email === "900900900@ejemplo.com") {
                persistUserWithRole(userData, "administrador");
            } else {
                persistUserWithRole(userData, "cliente");
            }
        }
    };

    // Función de logout
    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        localStorage.removeItem("user_with_role");
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
