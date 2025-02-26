import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileText } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const FileUploader = ({ onUploadSuccess, clientId }) => {
    const [uploading, setUploading] = useState(false);
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    const onDrop = useCallback(
        async (acceptedFiles) => {
            if (!clientId) {
                toast.error("Por favor seleccione un cliente");
                return;
            }

            const file = acceptedFiles[0];
            if (!file) return;

            const allowedTypes = [".zip", ".rar", ".7z"];
            const fileType = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
            if (!allowedTypes.includes(fileType)) {
                toast.error("Solo se permiten archivos ZIP, RAR y 7Z");
                return;
            }

            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            formData.append("clientId", clientId);

            try {
                const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Asegurarse de que el archivo se subió correctamente
                if (response.data.success) {
                    onUploadSuccess && onUploadSuccess(response.data);
                } else {
                    throw new Error(response.data.message || "Error al subir el archivo");
                }
            } catch (error) {
                console.error("Error:", error);
                toast.error(error.message || "Error al cargar el archivo");
            } finally {
                setUploading(false);
            }
        },
        [clientId, token, API_URL, onUploadSuccess],
    );

    // Verifica que se está enviando el token correctamente:

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            toast.error("Por favor seleccione un archivo");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", clientId || "");
        formData.append("stationId", stationId || "");

        try {
            console.log("Enviando archivo con token:", token.substring(0, 20) + "...");

            const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            // Resto del código existente...
        } catch (error) {
            // Manejo de errores...
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/zip": [".zip"],
            "application/x-rar-compressed": [".rar"],
            "application/x-7z-compressed": [".7z"],
        },
        multiple: false,
    });

    return (
        <div
            {...getRootProps()}
            className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragActive ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/50" : "border-gray-300 dark:border-gray-700"
            } ${uploading ? "pointer-events-none opacity-50" : ""} `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
                <Upload
                    size={40}
                    className={`${isDragActive ? "text-blue-500" : "text-gray-400"}`}
                />
                <div className="text-center">
                    {isDragActive ? (
                        <p className="text-blue-500">Suelta el archivo aquí...</p>
                    ) : (
                        <>
                            <p className="text-gray-600 dark:text-gray-400">
                                Arrastra y suelta archivos aquí, o<span className="mx-1 text-blue-500">haz clic para seleccionar</span>
                            </p>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Archivos permitidos: ZIP, RAR, 7Z (máx. 50MB)</p>
                        </>
                    )}
                </div>
            </div>
            {uploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/10 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Cargando archivo...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileUploader;
