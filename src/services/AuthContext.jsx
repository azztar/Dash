// src/contexts/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/authService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar sesión al cargar
        const checkAuth = async () => {
            try {
                const currentUser = await authService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error("Error verificando autenticación:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        // Configurar listener para cambios de autenticación
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (nit, password) => {
        const { user } = await authService.login(nit, password);
        setUser(user);
        return user;
    };

    const logout = async () => {
        await authService.logout();
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
