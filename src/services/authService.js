// src/services/authService.js
import { supabase } from "@/lib/supabase";

export const authService = {
    async login(nit, password) {
        // Convertir NIT a email para autenticación estándar
        const email = `${nit}@ejemplo.com`;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Obtener rol y datos de usuario desde la tabla usuarios
        const { data: userData, error: userError } = await supabase.from("usuarios").select("*").eq("nit", nit).single();

        if (userError) throw userError;

        // Combinar datos de autenticación con perfil de usuario
        return {
            ...data,
            user: {
                ...data.user,
                rol: userData.rol,
                nombre_empresa: userData.nombre_empresa,
            },
        };
    },

    async logout() {
        return await supabase.auth.signOut();
    },
};

// src/services/dataService.js
import { supabase } from "@/lib/supabase";

export const dataService = {
    async getEstaciones() {
        const { data, error } = await supabase.from("estaciones").select("*");

        if (error) throw error;
        return data;
    },

    async getMedicionesAire(estacionId, parametroId) {
        const { data, error } = await supabase
            .from("mediciones_aire")
            .select("*, estaciones!inner(*), normas!inner(*)")
            .eq("id_estacion", estacionId)
            .eq("id_norma", parametroId);

        if (error) throw error;
        return { data };
    },
};
