import React, { useState, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { storageService } from "@/services/storageService";

// Función para convertir la cadena accept a un objeto aceptado por react-dropzone v14+
const parseAcceptProp = (acceptString) => {
    if (!acceptString) return undefined;

    const result = {};
    const types = acceptString.split(",");

    types.forEach((type) => {
        type = type.trim();
        // Si empieza con punto, es una extensión de archivo
        if (type.startsWith(".")) {
            // Convertimos a un objeto de extensiones
            const extension = type.substring(1).toLowerCase();
            if (!result[""]) result[""] = [];
            result[""].push(`.${extension}`);
        }
        // Si contiene /, es un tipo MIME
        else if (type.includes("/")) {
            // Para tipos MIME, usamos el formato esperado
            result[type] = [];
        }
    });

    return Object.keys(result).length > 0 ? result : undefined;
};

// Componente con forwardRef para poder recibir la referencia
const FileUploader = forwardRef(({ onUploadSuccess, clientId, accept }, ref) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { token, user } = useAuth();
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
            if (acceptedFiles.length === 0) return;

            const file = acceptedFiles[0];
            console.log("Archivo seleccionado:", file.name);

            setUploading(true);
            try {
                // 1. Primero intentamos subir al almacenamiento en la nube (Firebase o Supabase)
                console.log("Enviando archivo a almacenamiento en la nube...");

                // Identificar el cliente correcto (podría ser el usuario actual o un ID específico)
                const effectiveClientId = clientId || (user ? user.id : "default");

                const storageResult = await storageService.uploadFile(file, {
                    clienteId: effectiveClientId,
                    // No tenemos estación ni otros metadatos aquí
                });

                if (!storageResult.success) {
                    throw new Error("Error al subir el archivo al almacenamiento en la nube");
                }

                console.log("Archivo subido a la nube correctamente:", storageResult);

                // 2. Ahora registramos el archivo en la base de datos a través del backend
                const formData = new FormData();
                formData.append("file", file);

                if (clientId) {
                    formData.append("id_cliente", clientId);
                }

                // Añadir información del almacenamiento en la nube
                formData.append("storage_provider", storageResult.provider);
                formData.append("storage_path", storageResult.filePath);
                formData.append("storage_url", storageResult.fileUrl);

                const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.data.success) {
                    console.log("Archivo registrado correctamente en la base de datos");
                    toast.success("Archivo cargado con éxito");
                    if (onUploadSuccess) {
                        // Pasar tanto la información del backend como la del almacenamiento
                        onUploadSuccess({
                            ...response.data,
                            storage: storageResult,
                        });
                    }
                } else {
                    // Si la API devuelve éxito=false
                    throw new Error(response.data.message || "Error desconocido al registrar el archivo");
                }
            } catch (error) {
                console.error("Error al subir archivo:", error);
                toast.error(error.message || "Error al cargar el archivo. Intente nuevamente.");
            } finally {
                setUploading(false);
            }
        },
        [token, clientId, onUploadSuccess, API_URL, user],
    );

    // Convertir la cadena accept al formato esperado por react-dropzone
    const acceptOptions = parseAcceptProp(accept);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptOptions,
        maxFiles: 1,
        disabled: uploading,
    });

    // Formato de texto de tipos permitidos para mostrar al usuario
    const acceptFormatText = accept ? accept.replace(/,/g, ", ") : "Cualquier tipo de archivo hasta 50MB";

    return (
        <div
            {...getRootProps()}
            className={`cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors ${
                isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-gray-300 dark:border-gray-700"
            } ${uploading ? "cursor-not-allowed opacity-50" : ""}`}
        >
            <div className="flex flex-col items-center justify-center text-center">
                <Upload className="mb-3 h-12 w-12 text-gray-400" />
                <input
                    {...getInputProps()}
                    ref={fileInputRef}
                    disabled={uploading}
                />

                {uploading ? (
                    <div className="text-center">
                        <div className="mb-2 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent text-blue-500"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">Subiendo archivo...</p>
                    </div>
                ) : (
                    <>
                        <p className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {isDragActive ? "Suelta el archivo aquí" : "Arrastra y suelta un archivo, o haz clic para seleccionar"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {accept ? `Formatos permitidos: ${acceptFormatText}` : "Cualquier tipo de archivo hasta 50MB"}
                        </p>
                    </>
                )}
            </div>
        </div>
    );
});

FileUploader.displayName = "FileUploader";

export default FileUploader;
