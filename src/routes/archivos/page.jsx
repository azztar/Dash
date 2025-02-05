// src/routes/Archivos/page.jsx
import React, { useState, useEffect } from "react";
import { Upload, File } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { useTheme } from "@/hooks/use-theme"; // Para manejar el tema claro/oscuro
import { Footer } from "@/layouts/footer"; // Pie de página

const ReportsPage = () => {
    const [files, setFiles] = useState([]);
    const [userRole, setUserRole] = useState("admin"); // 'user' or 'admin'
    const { theme } = useTheme(); // Accede al tema actual

    useEffect(() => {
        fetchUserFiles();
    }, []);

    const fetchUserFiles = async () => {
        try {
            // Simulación de datos (reemplazar con llamada a API real)
            const mockData = [
                { id: 1, name: "Informe_Enero.pdf", uploadDate: "2023-01-15", isNew: true },
                { id: 2, name: "Informe_Febrero.pdf", uploadDate: "2023-02-20", isNew: false },
            ];
            setFiles(mockData);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Simulación de subida de archivo (reemplazar con llamada a API real)
            console.log("Archivo subido:", file.name);
            fetchUserFiles(); // Refrescar la lista de archivos
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleFileDownload = (file) => {
        // Simulación de descarga de archivo (reemplazar con URL real)
        window.open(`/api/reports/download/${file.id}`, "_blank");
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 transition-colors dark:bg-slate-950">
            {/* Título de la página */}
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-50">Informes</h1>

            {/* Sección de subida de archivos (solo para administradores) */}
            {userRole === "admin" && (
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Subir Nuevo Informe</CardTitle>
                    </CardHeader>
                    <CardContent className="flex items-center gap-x-4">
                        <Input
                            type="file"
                            onChange={handleFileUpload}
                            className="w-full"
                        />
                        <Button variant="outline">
                            <Upload className="mr-2 size-4" /> Subir
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Lista de archivos */}
            <Card>
                <CardHeader>
                    <CardTitle>Mis Informes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        {files.length === 0 ? (
                            <p className="text-slate-500">No hay informes disponibles</p>
                        ) : (
                            files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex cursor-pointer items-center justify-between rounded-lg border p-4 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    onClick={() => handleFileDownload(file)}
                                >
                                    <div className="flex items-center gap-x-4">
                                        <File className="text-blue-500" />
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-50">{file.name}</p>
                                            <p className="text-sm text-slate-500">Subido el {new Date(file.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    {file.isNew && <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Nuevo</span>}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default ReportsPage;
