import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@tremor/react"; // Asegúrate de que @tremor/react está instalado
import { Download, FileText, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import FileUploader from "../../components/FileUploader"; // Cambiado a ruta relativa

const AdminFiles = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState("");
    const { token, user } = useAuth(); // Agregar user
    const isAdmin = user?.rol === "administrador";
    const API_URL = import.meta.env.VITE_API_URL;

    // Cargar archivos
    const fetchFiles = async (clientId = null) => {
        try {
            let url = `${API_URL}/api/files/list`;

            // Si es admin y hay cliente seleccionado, filtrar por ese cliente
            if (isAdmin && clientId) {
                url += `?clientId=${clientId}`;
            }

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setFiles(response.data.files);
            setLoading(false);
        } catch (error) {
            console.error("Error al cargar archivos:", error);
            toast.error("Error al cargar archivos");
            setLoading(false);
        }
    };

    // Cargar clientes
    useEffect(() => {
        const fetchClients = async () => {
            try {
                const response = await axios.get(`${API_URL}/api/clients`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setClients(response.data.data);
            } catch (error) {
                console.error("Error al cargar clientes:", error);
                toast.error("Error al cargar clientes");
            }
        };

        if (token) {
            fetchClients();
            fetchFiles();
        }
    }, [token]);

    const handleDownload = async (fileId) => {
        try {
            const response = await axios.get(`${API_URL}/api/files/download/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: "blob",
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.download = `archivo-${fileId}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success("Archivo descargado correctamente");
        } catch (error) {
            toast.error("Error al descargar el archivo");
        }
    };

    const handleDelete = async (fileId) => {
        if (!window.confirm("¿Está seguro de eliminar este archivo?")) return;

        try {
            await axios.delete(`${API_URL}/api/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Archivo eliminado correctamente");

            // Recargar con el filtro actual
            if (selectedClient) {
                fetchFiles(selectedClient);
            } else {
                fetchFiles();
            }
        } catch (error) {
            console.error("Error al eliminar archivo:", error);
            toast.error(error.response?.data?.message || "Error al eliminar el archivo");
        }
    };

    const handleUploadSuccess = () => {
        fetchFiles(selectedClient);
        toast.success("Archivo cargado exitosamente");
    };

    const handleClientChange = (e) => {
        const clientId = e.target.value;
        setSelectedClient(clientId);
        if (clientId) {
            fetchFiles(clientId);
        } else {
            fetchFiles();
        }
    };

    const handleSubmitUpload = async () => {
        if (!selectedClient) {
            toast.error("Por favor seleccione un cliente");
            return;
        }

        // El FileUploader se activará automáticamente
        document.querySelector('input[type="file"]').click();
    };

    // Solo mostrar el selector de clientes y uploader si es admin
    const renderAdminControls = () => {
        if (!isAdmin) return null;

        return (
            <Card className="mb-6">
                <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">Seleccionar Cliente para Envío</label>
                    <select
                        value={selectedClient}
                        onChange={handleClientChange}
                        className="w-full rounded-lg border border-gray-300 p-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="">Seleccione un cliente</option>
                        {clients.map((client) => (
                            <option
                                key={client.id_usuario}
                                value={client.id_usuario}
                                className="dark:bg-gray-800 dark:text-white"
                            >
                                {client.nombre_empresa || client.nombre_usuario}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-4">
                    <FileUploader
                        onUploadSuccess={handleUploadSuccess}
                        clientId={selectedClient}
                    />
                    <button
                        onClick={handleSubmitUpload}
                        disabled={!selectedClient}
                        className={`w-full rounded-lg p-2 text-white transition-colors ${
                            selectedClient ? "bg-blue-500 hover:bg-blue-600" : "cursor-not-allowed bg-gray-400"
                        }`}
                    >
                        Confirmar Envío
                    </button>
                </div>
            </Card>
        );
    };

    return (
        <div className="min-h-screen p-6">
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">{isAdmin ? "Gestión de Archivos" : "Mis Archivos"}</h1>

            {renderAdminControls()}

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

export default AdminFiles;
