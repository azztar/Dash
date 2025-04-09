// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
    },
    debug: true, // Activar modo debug para obtener más información sobre errores
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

// Nueva función para verificar e informar sobre buckets
export const checkBuckets = async () => {
    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error("Error al listar buckets:", error);
            return { success: false, error };
        }

        console.log(
            "Buckets disponibles:",
            buckets?.map((b) => b.name),
        );

        // Verificar si existe el bucket "files"
        const filesBucket = buckets?.find((b) => b.name === "files");

        return {
            success: true,
            buckets,
            filesBucketExists: !!filesBucket,
            totalBuckets: buckets?.length || 0,
        };
    } catch (err) {
        console.error("Error verificando buckets:", err);
        return { success: false, error: err };
    }
};
