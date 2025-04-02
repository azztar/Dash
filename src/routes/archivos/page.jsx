// src/routes/Archivos/page.jsx
import React, { useState, useEffect, useRef } from "react";
import { Upload, File, Map, Loader, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Footer } from "@/layouts/footer";
import { PageContainer } from "@/components/PageContainer";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";

const ReportsPage = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null); // Referencia para el input de archivo
    const { token, user } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL;
    const isAdmin = user?.rol === "administrador" || user?.rol === "empleado";

    useEffect(() => {
        if (token) {
            fetchUserFiles();
        }
    }, [token]);

    const fetchUserFiles = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/files/list`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Archivos cargados:", response.data);
            setFiles(response.data.files || []);
        } catch (error) {
            console.error("Error al cargar archivos:", error);
            toast.error("No se pudieron cargar los archivos");
        } finally {
            setLoading(false);
        }
    };

    // Corrige la función handleFileUpload para obtener el archivo correctamente
    const handleFileUpload = async (event) => {
        // Obtener el archivo del input (esta línea faltaba)
        const file = event.target.files[0];

        // Validar que exista un archivo seleccionado
        if (!file) {
            toast.error("Por favor selecciona un archivo");
            return;
        }

        console.log("Archivo seleccionado:", file);
        console.log("Tipo:", file.type);
        console.log("Nombre:", file.name);
        console.log("Tamaño:", file.size);

        // Validar que sea un archivo KMZ
        if (!file.name.toLowerCase().endsWith(".kmz")) {
            toast.error("Solo se permiten archivos KMZ");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            toast.info("Subiendo archivo...");

            console.log("Enviando archivo al servidor:", file.name);

            const response = await axios.post(`${API_URL}/api/files/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Respuesta del servidor:", response.data);

            if (response.data.success) {
                toast.success("Archivo subido correctamente");
                fetchUserFiles();
            } else {
                toast.error(response.data.message || "Error al subir el archivo");
            }
        } catch (error) {
            console.error("Error al subir archivo:", error);
            toast.error(error.response?.data?.message || "Error al subir el archivo");
        } finally {
            setLoading(false);
            // Limpiar el input de archivo
            event.target.value = null;
        }
    };

    const handleDownload = async (file) => {
        try {
            toast.info("Descargando archivo...");
            window.open(`${API_URL}/api/files/download/${file.id_archivo}?token=${token}`, "_blank");
        } catch (error) {
            console.error("Error al descargar archivo:", error);
            toast.error("Error al descargar el archivo");
        }
    };

    return (
        <PageContainer>
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Archivos KMZ de Estaciones</h1>

            {/* Sección de subida de archivos (solo para administradores) */}
            {isAdmin && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Subir Nuevo Archivo KMZ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col items-start gap-4 md:flex-row">
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    className="w-full rounded border p-2 dark:border-slate-600 dark:bg-slate-700"
                                    accept=".kmz,application/vnd.google-earth.kmz"
                                />
                                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400 md:mt-0">
                                    Solo se permiten archivos KMZ (Google Earth)
                                </div>
                            </div>
                            <div>
                                <Button
                                    type="button"
                                    onClick={() => document.querySelector('input[type="file"]').click()}
                                    className="w-full md:w-auto"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader className="mr-2 h-4 w-4 animate-spin" /> Subiendo...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" /> Seleccionar Archivo KMZ
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Resto del código existente... */}
            <Card>
                <CardHeader>
                    <CardTitle>Archivos KMZ de Estaciones</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading && !files.length ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader className="h-8 w-8 animate-spin text-blue-500" />
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {files.length === 0 ? (
                                <p className="py-4 text-center text-slate-500 dark:text-slate-400">No hay archivos KMZ disponibles</p>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                    {files.map((file) => (
                                        <div
                                            key={file.id_archivo}
                                            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <div className="p-4">
                                                <h3 className="mb-2 line-clamp-1 text-sm font-medium">{file.nombre_original}</h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Subido: {new Date(file.fecha_carga).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-800">
                                                {/* Solo mostramos el botón de descarga */}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDownload(file)}
                                                >
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Descargar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
            <Footer />
        </PageContainer>
    );
};

export default ReportsPage;
