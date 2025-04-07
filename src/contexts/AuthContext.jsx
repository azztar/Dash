import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verificar sesión al cargar
    useEffect(() => {
        const checkSession = async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) {
                setUser(data.session.user);
            }
            setLoading(false);
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
            // 1. Primero autenticar con Supabase (ya lo tienes)

            // 2. Después consultar la información del usuario incluyendo el rol desde MySQL
            const response = await axios.get(`${API_URL}/api/auth/user-info`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // 3. Combinar la información de Supabase con los datos de MySQL (especialmente el rol)
            const userWithRole = {
                ...userData,
                ...response.data.user,
                // Asegurarse que el rol venga de MySQL
                rol: response.data.user.rol,
            };

            // 4. Guardar el usuario completo en el estado
            setUser(userWithRole);
            localStorage.setItem("token", token);
        } catch (error) {
            console.error("Error al obtener información del usuario:", error);
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
