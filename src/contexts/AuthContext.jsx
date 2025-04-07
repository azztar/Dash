import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import { supabase, checkAndCreateUser } from "@/lib/supabase";

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
        console.log(`👑 Usuario con rol ${rolValue}:`, userWithRole);
        localStorage.setItem("user_with_role", JSON.stringify(userWithRole));
        setUser(userWithRole);
        return userWithRole;
    };

    // Verificar sesión al cargar
    useEffect(() => {
        if (initialCheckDone.current) return;

        const checkSession = async () => {
            try {
                setLoading(true);
                console.log("⏳ Verificando token...");

                // 1. Verificar sesión en Supabase
                const { data } = await supabase.auth.getSession();

                console.log("🔑 Enviando token:", data.session?.access_token ? data.session.access_token.substring(0, 10) + "..." : "No hay token");

                if (!data.session) {
                    console.log("❌ No hay sesión activa");
                    setLoading(false);
                    initialCheckDone.current = true;
                    return;
                }

                console.log("✅ Respuesta de verificación:", data);

                // 2. Obtener rol desde Supabase
                const email = data.session.user.email;
                const nit = email.split("@")[0];

                console.log("👤 Usuario autenticado:", nit);

                // Buscar en tabla personalizada
                const { data: userData, error } = await supabase.from("usuarios").select("*").eq("nit", nit).single();

                if (error) {
                    console.error("❌ Error al obtener datos de usuario:", error);

                    // Si el usuario es administrador predefinido
                    if (email === "900900900@ejemplo.com") {
                        console.log("⭐ Usuario admin predefinido, asignando rol administrador");
                        persistUserWithRole(data.session.user, "administrador");
                    } else {
                        // Crear usuario cliente en la tabla personalizada
                        await checkAndCreateUser(data.session.user, "cliente");
                        persistUserWithRole(data.session.user, "cliente");
                    }
                } else {
                    console.log("✅ Datos de usuario encontrados:", userData);
                    persistUserWithRole(data.session.user, userData.rol);
                }
            } catch (error) {
                console.error("❌ Error verificando sesión:", error);
            } finally {
                console.log("🔄 Verificación de auth completada");
                setLoading(false);
                initialCheckDone.current = true;
            }
        };

        checkSession();
    }, []);

    // Función de login usando Supabase
    const login = async (token, userData) => {
        try {
            console.log("🔑 Login iniciado con token:", token ? "Presente" : "Ausente");

            // Obtener rol desde Supabase
            const email = userData.email;
            const nit = email.split("@")[0];

            // Buscar en tabla personalizada
            const { data: userProfile, error } = await supabase.from("usuarios").select("rol, nombre_empresa").eq("nit", nit).single();

            if (error) {
                console.error("❌ Error al obtener perfil:", error);

                // Si es el admin predefinido
                if (email === "900900900@ejemplo.com") {
                    console.log("⭐ Asignando rol administrador");
                    persistUserWithRole(userData, "administrador");
                } else {
                    // Crear usuario cliente en la tabla personalizada
                    await checkAndCreateUser(userData, "cliente");
                    persistUserWithRole(userData, "cliente");
                }
            } else {
                console.log("✅ Perfil encontrado:", userProfile);
                persistUserWithRole(userData, userProfile.rol);
            }
        } catch (error) {
            console.error("❌ Error en login:", error);

            // Si falla todo, asegurar un rol por defecto
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
                token: user?.access_token || localStorage.getItem("sb-token"),
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
