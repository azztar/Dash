import { useContext } from "react";
import { AuthContext } from "@/layouts/AuthProvider";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }

    // Helpers para verificar permisos
    const isAdmin = context.user?.rol === "administrador";
    const isEmployee = context.user?.rol === "empleado";
    const isClient = context.user?.rol === "cliente";

    return {
        ...context,
        isAdmin,
        isEmployee,
        isClient,
    };
};

export default useAuth;
