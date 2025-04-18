import React, { useState, useEffect } from "react";
import { Card } from "@tremor/react";
import { Download, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

const ClientFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        const getFiles = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/files/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setFiles(response.data.files || []);
            } catch (error) {
                console.error("Error al cargar archivos:", error);
                toast.error("Error al cargar archivos");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            getFiles();
        }
    }, [token, API_URL]);

    const handleDownload = async (fileId, fileName) => {
        try {
            const response = await axios.get(`${API_URL}/api/files/download/${fileId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: "blob", // Importante para manejar archivos
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName || "archivo-descargado"; // Usa el nombre original o un genérico
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            toast.success("Descarga iniciada");
        } catch (error) {
            console.error("Error al descargar:", error);
            toast.error("Error al descargar el archivo");
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
                                        {file.tipo_archivo?.toLowerCase() === ".kmz" ? (
                                            <FileText className="h-8 w-8 flex-shrink-0 text-blue-500" />
                                        ) : (
                                            <FileText className="h-8 w-8 flex-shrink-0 text-blue-500" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="max-w-full truncate font-medium text-gray-900 dark:text-white">{file.nombre_original}</p>
                                            <p className="text-sm text-gray-500">Subido el: {new Date(file.fecha_carga).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex w-full justify-end space-x-2 sm:w-auto sm:space-x-3">
                                        <button
                                            onClick={() => handleDownload(file.id_archivo, file.nombre_original)}
                                            className="rounded-md bg-blue-500 p-2 text-white transition-colors hover:bg-blue-600 sm:rounded-lg sm:p-2"
                                            aria-label="Descargar archivo"
                                        >
                                            <Download size={18} />
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
