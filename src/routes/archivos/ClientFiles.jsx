import React, { useState, useEffect } from "react";
import { Card } from "@tremor/react";
import { Download, FileText, Trash2, MoreVertical } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { Menu, Transition } from "@headlessui/react";

const ClientFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        if (token) {
            fetchFiles();
        }
    }, [token]);

    const fetchFiles = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/files/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFiles(response.data.files);
        } catch (error) {
            console.error("Error al cargar archivos:", error);
            toast.error("Error al cargar archivos");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (fileId) => {
        try {
            // Mostrar indicador de descarga
            toast.info("Iniciando descarga...");

            // 1. Crear un enlace directo al archivo para descarga
            const url = `${API_URL}/api/files/download/${fileId}`;

            // 2. Crear un iframe temporal invisible para forzar la descarga
            // Este método suele funcionar mejor para archivos binarios que el método Blob
            const iframe = document.createElement("iframe");
            iframe.style.display = "none";
            iframe.src = url + `?token=${token}`; // Pasar el token como query parameter
            document.body.appendChild(iframe);

            // 3. Mostrar mensaje de éxito después de un tiempo razonable
            setTimeout(() => {
                document.body.removeChild(iframe);
                toast.success("Descarga iniciada correctamente");
            }, 1000);
        } catch (error) {
            console.error("Error al descargar:", error);
            toast.error("Error al descargar el archivo");
        }
    };

    const handleDelete = async (fileId) => {
        try {
            // Mostrar indicador de eliminación
            toast.info("Iniciando eliminación...");

            // 1. Realizar la solicitud de eliminación
            await axios.delete(`${API_URL}/api/files/delete/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 2. Actualizar la lista de archivos
            setFiles(files.filter((file) => file.id_archivo !== fileId));

            // 3. Mostrar mensaje de éxito
            toast.success("Archivo eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar:", error);
            toast.error("Error al eliminar el archivo");
        }
    };

    return (
        <div className="min-h-screen p-6">
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Mis Archivos</h1>

            <Card>
                {loading ? (
                    <div className="animate-pulse space-y-4 p-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-16 rounded-lg bg-gray-200 dark:bg-gray-700"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {files.length === 0 ? (
                            <p className="p-4 text-center text-gray-500">No hay archivos disponibles.</p>
                        ) : (
                            files.map((file) => (
                                <div
                                    key={file.id_archivo}
                                    className="flex flex-col items-start justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 sm:flex-row sm:items-center"
                                >
                                    <div className="mb-3 flex w-full items-start space-x-3 sm:mb-0 sm:w-3/4 sm:items-center sm:space-x-4">
                                        <FileText className="h-8 w-8 flex-shrink-0 text-blue-500" />
                                        <div className="min-w-0 flex-1">
                                            <p className="max-w-full truncate font-medium text-gray-900 dark:text-white">{file.nombre_original}</p>
                                            <p className="text-sm text-gray-500">Subido el: {new Date(file.fecha_carga).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full justify-end space-x-2 sm:w-auto sm:space-x-3">
                                        <button
                                            onClick={() => handleDownload(file.id_archivo)}
                                            className="rounded-md bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 sm:rounded-lg sm:p-2"
                                            aria-label="Descargar archivo"
                                        >
                                            <Download size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.id_archivo)}
                                            className="rounded-md bg-red-500 p-2 text-white transition-colors hover:bg-red-600 sm:rounded-lg sm:p-2"
                                            aria-label="Eliminar archivo"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ClientFiles;
