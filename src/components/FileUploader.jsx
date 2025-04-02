import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

// Componente con forwardRef para poder recibir la referencia
const FileUploader = forwardRef(({ onUploadSuccess, clientId, accept }, ref) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    // Exponemos la función openFileSelector a través de la ref
    useImperativeHandle(ref, () => ({
        openFileSelector: () => {
            if (fileInputRef.current) {
                console.log("Abriendo selector de archivos");
                fileInputRef.current.click();
            } else {
                console.error("fileInputRef no está definido");
            }
        },
    }));

    const onDrop = useCallback(
        async (acceptedFiles) => {
            if (!clientId) {
                toast.error("Por favor seleccione un cliente");
                return;
            }

            const file = acceptedFiles[0];
            if (!file) return;

            setUploading(true);
            const formData = new FormData();
            formData.append("file", file);
            // Cambiar el nombre del parámetro para que coincida con el backend
            formData.append("id_cliente", clientId);

            try {
                // Añadir log para depuración
                console.log("Enviando archivo:", file.name, "para cliente ID:", clientId);

                const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    onUploadSuccess && onUploadSuccess(response.data);
                    toast.success("Archivo subido correctamente");
                } else {
                    throw new Error(response.data.message || "Error al subir el archivo");
                }
            } catch (error) {
                console.error("Error completo:", error);
                // Mostrar más detalles del error
                const errorMsg = error.response?.data?.message || error.message || "Error al cargar el archivo";
                toast.error(errorMsg);
            } finally {
                setUploading(false);
            }
        },
        [clientId, token, API_URL, onUploadSuccess],
    );

    // Creamos un input file independiente para más control
    const handleNativeInputChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onDrop([file]);
        }
    };

    // Configuración correcta de los tipos MIME para react-dropzone
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/zip": [".zip"],
            "application/x-rar-compressed": [".rar"],
            "application/x-7z-compressed": [".7z"],
            "application/vnd.google-earth.kmz": [".kmz"],
            "application/vnd.google-earth.kml+xml": [".kml"],
            // No usar cadena vacía como clave
            "application/octet-stream": [".zip", ".rar", ".7z", ".kmz", ".kml"],
        },
        multiple: false,
        // No filtramos estrictamente por tipo MIME para mejor compatibilidad
        noKeyboard: true,
        noClick: false,
        noDrag: false,
        noDragEventsBubbling: false,
    });

    return (
        <>
            {/* Input nativo oculto para abrir mediante JavaScript */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleNativeInputChange}
                style={{ display: "none" }}
                accept=".zip,.rar,.7z,.kmz,.kml"
            />

            {/* Botón explícito separado para seleccionar archivos */}
            <button
                type="button"
                className="mb-4 w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
                onClick={(e) => {
                    e.stopPropagation();
                    if (fileInputRef.current) {
                        fileInputRef.current.click();
                    }
                }}
            >
                Seleccionar archivo (ZIP, RAR, 7Z, KMZ)
            </button>

            {/* Área de drop zone */}
            <div
                {...getRootProps()}
                className={`relative cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ${
                    isDragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                } dark:border-gray-600 dark:bg-gray-800 dark:hover:bg-gray-700`}
            >
                <div className="flex flex-col items-center">
                    <Upload className={`mb-2 h-10 w-10 ${uploading ? "animate-pulse text-blue-500" : "text-gray-400"}`} />
                    <p className="mb-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        {uploading ? "Subiendo archivo..." : isDragActive ? "Suelte el archivo aquí" : "Arrastre y suelte archivos aquí"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Tipos permitidos: ZIP, RAR, 7Z, KMZ, KML</p>
                </div>
            </div>
        </>
    );
});

FileUploader.displayName = "FileUploader";
export default FileUploader;
