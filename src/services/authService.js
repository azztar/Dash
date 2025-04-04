// src/services/authService.js
import { supabase } from "@/lib/supabase";

export const authService = {
    async login(nit, password) {
        // Convertir NIT a email para autenticación estándar de Supabase
        const email = `${nit}@ejemplo.com`;

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return data;
    },

    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    async getCurrentUser() {
        const { data } = await supabase.auth.getUser();
        return data?.user;
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
