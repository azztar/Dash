// src/services/storageService.js
import { API_BASE_URL } from "../config/constants";
import axios from "axios";
import { supabaseStorage } from "./supabaseStorage";

// Servicio de almacenamiento único que decide qué proveedor usar
export const storageService = {
    uploadFile: async (file, metadata) => {
        try {
            // Usar Supabase como proveedor principal
            return await supabaseStorage.uploadFile(file, metadata);
        } catch (error) {
            console.error("Error en almacenamiento principal:", error);
            throw error;
        }
    },
};

export default storageService;
