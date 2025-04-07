import axios from "axios";
import { API_BASE_URL } from "../config/constants";
import { supabase } from "@/lib/supabase";

export const measurementService = {
    async getAvailableDates(stationId, parameterId) {
        try {
            console.log("🔍 Solicitando fechas:", { stationId, parameterId });

            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/api/measurements/dates`, {
                params: { stationId, parameterId },
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("📅 Respuesta del servidor:", response.data);
            return response.data.dates;
        } catch (error) {
            console.error("❌ Error al obtener fechas:", error);
            return [];
        }
    },

    async getStations() {
        const { data, error } = await supabase.from("estaciones").select("*");

        if (error) throw error;
        return data;
    },

    async uploadMeasurements(formData) {
        // Para subir archivos a Supabase Storage
        const file = formData.get("file");

        // Subir a Storage
        const { data: fileData, error: fileError } = await supabase.storage.from("measurements").upload(`${Date.now()}-${file.name}`, file);

        if (fileError) throw fileError;

        // Guardar metadata en la tabla de mediciones
        const { data, error } = await supabase.from("mediciones_aire").insert([
            {
                id_estacion: formData.get("stationId"),
                id_norma: formData.get("parameterId"),
                fecha_inicio_muestra: formData.get("fecha_inicio_muestra"),
                archivo_url: fileData.path,
            },
        ]);

        if (error) throw error;
        return data;
    },
};
