// src/services/dataService.js
import { supabase } from "@/lib/supabase";

export const dataService = {
    async getEstaciones() {
        const { data, error } = await supabase.from("estaciones").select("*");

        if (error) throw error;
        return data;
    },

    async getMedicionesAire(estacionId, parameterId) {
        const { data, error } = await supabase
            .from("mediciones_aire")
            .select(
                `
        *,
        estaciones:id_estacion(*),
        normas:id_norma(*)
      `,
            )
            .eq("id_estacion", estacionId)
            .eq("id_norma", parameterId);

        if (error) throw error;
        return { data };
    },
};
