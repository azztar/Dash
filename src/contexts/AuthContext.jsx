import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem("token");
                if (token) {
                    const response = await axios.get("http://localhost:5000/api/protected", {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error("Error al verificar autenticación:", error);
                localStorage.removeItem("token");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (token, userData) => {
        localStorage.setItem("token", token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
