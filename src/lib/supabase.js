// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
    },
});

// Función para verificar si un usuario existe en la tabla de usuarios personalizada
export const checkAndCreateUser = async (auth_user, role = "cliente") => {
    try {
        // Verificar si existe en la tabla personalizada
        const { data, error } = await supabase.from("usuarios").select("*").eq("nit", auth_user.email.split("@")[0]).single();

        // Si no existe, crearlo
        if (error || !data) {
            const nit = auth_user.email.split("@")[0];
            await supabase.from("usuarios").insert({
                id_usuario: auth_user.id,
                email: auth_user.email,
                nit: nit,
                nombre_usuario: `Usuario ${nit}`,
                rol: role,
                nombre_empresa: `Empresa ${nit}`,
                fecha_registro: new Date(),
            });
            return { nit, rol: role };
        }

        return data;
    } catch (err) {
        console.error("Error verificando/creando usuario:", err);
        return null;
    }
};
