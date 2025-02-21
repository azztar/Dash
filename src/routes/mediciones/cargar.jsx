import React, { useState, useEffect } from "react";
import { Card, Select, SelectItem } from "@tremor/react";
// Usar el DatePicker genérico para el formulario de carga
import DatePicker from "@/components/DatePicker";
import { es } from "date-fns/locale";
import { clientService } from "@/services/clientService";
import { Upload } from "lucide-react";
import { AdminDateSelector } from "@/components/AdminDateSelector";
import axios from "axios";
import { toast } from "react-toastify";

// 1. Primero, agrega la variable de entorno para la URL del API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DataUploadPage = () => {
    const [selectedClient, setSelectedClient] = useState("");
    const [selectedStation, setSelectedStation] = useState("");
    const [selectedParameter, setSelectedParameter] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [clients, setClients] = useState([]);
    const [parameters, setParameters] = useState([
        { id: "PM10", name: "PM10" },
        { id: "PM2.5", name: "PM2.5" },
        { id: "SO2", name: "SO2" },
        { id: "NO2", name: "NO2" },
        { id: "O3", name: "O3" },
        { id: "CO", name: "CO" },
    ]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [stations, setStations] = useState([]);
    const [declarationFile, setDeclarationFile] = useState(null);

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        if (selectedClient) {
            loadStations(selectedClient);
        } else {
            setStations([]);
        }
    }, [selectedClient]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const clientsData = await clientService.getClients();
            setClients(clientsData || []);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
            setClients([]);
        } finally {
            setLoading(false);
        }
    };

    const loadStations = async (clientId) => {
        try {
            setLoading(true);
            // Estaciones predeterminadas que se usarán siempre
            const defaultStations = [
                { id_estacion: "1", nombre_estacion: "Estación 1" },
                { id_estacion: "2", nombre_estacion: "Estación 2" },
                { id_estacion: "3", nombre_estacion: "Estación 3" },
                { id_estacion: "4", nombre_estacion: "Estación 4" },
            ];

            setStations(defaultStations);
        } catch (error) {
            console.error("Error al cargar estaciones:", error);
            setStations([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setFile(file);
        }
    };

    const handleDeclarationFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setDeclarationFile(file);
        }
    };

    const resetForm = () => {
        setFile(null);
        setDeclarationFile(null);
        setSelectedParameter("");
        setSelectedStation("");
        setSelectedDate(new Date());
    };

    // 2. Modifica el handleSubmit para usar la URL correcta
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Primero cargar mediciones
            const medicionesFormData = new FormData();
            medicionesFormData.append("file", file);
            medicionesFormData.append("stationId", selectedStation);
            medicionesFormData.append("parameterId", selectedParameter);
            medicionesFormData.append("selectedClient", selectedClient);
            medicionesFormData.append("fecha_inicio_muestra", selectedDate.toISOString().split("T")[0]);

            const medicionesResponse = await axios.post(`${API_URL}/api/measurements/upload`, medicionesFormData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (medicionesResponse.data.success && declarationFile) {
                // Si hay archivo de declaraciones, cargarlo
                const declaracionesFormData = new FormData();
                declaracionesFormData.append("file", declarationFile);
                declaracionesFormData.append("stationId", selectedStation);
                declaracionesFormData.append("parameterId", selectedParameter);
                declaracionesFormData.append("selectedClient", selectedClient);
                declaracionesFormData.append("fecha", selectedDate.toISOString().split("T")[0]);

                const declaracionesResponse = await axios.post(`${API_URL}/api/declarations/upload`, declaracionesFormData, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                });

                if (declaracionesResponse.data.success) {
                    toast.success("Mediciones y declaraciones cargadas exitosamente");
                }
            } else {
                toast.success("Mediciones cargadas exitosamente");
            }
            resetForm();
        } catch (error) {
            console.error("Error al cargar datos:", error);
            toast.error(error.response?.data?.message || "Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="mb-8 text-2xl font-bold">Carga de Mediciones y Declaraciones</h1>

            <form onSubmit={handleSubmit}>
                <Card className="space-y-8">
                    {/* Sección de Selección */}
                    <div className="space-y-12">
                        {" "}
                        {/* Aumentamos el espaciado vertical */}
                        {/* Cliente */}
                        <div className="space-y-6">
                            {" "}
                            {/* Aumentamos el espaciado */}
                            <h2 className="text-lg font-semibold text-gray-900">Información del Cliente</h2>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                <div className="relative">
                                    {" "}
                                    {/* Añadimos posición relativa */}
                                    <label className="mb-3 block text-sm font-medium text-gray-700">Cliente</label>
                                    <div className="relative z-20">
                                        {" "}
                                        {/* Control del z-index */}
                                        <Select
                                            value={selectedClient}
                                            onValueChange={setSelectedClient}
                                            placeholder="Seleccione un cliente"
                                            disabled={loading}
                                        >
                                            {clients.map((client) => (
                                                <SelectItem
                                                    key={client.id_usuario}
                                                    value={client.id_usuario}
                                                >
                                                    {client.nombre_empresa}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Estación y Parámetro */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Detalles de Medición</h2>
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                <div className="relative">
                                    <label className="mb-3 block text-sm font-medium text-gray-700">Estación</label>
                                    <div className="relative z-10">
                                        <Select
                                            value={selectedStation}
                                            onValueChange={setSelectedStation}
                                            placeholder="Seleccione una estación"
                                            disabled={!selectedClient || loading}
                                        >
                                            {stations.map((station) => (
                                                <SelectItem
                                                    key={station.id_estacion}
                                                    value={station.id_estacion}
                                                >
                                                    {station.nombre_estacion}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="mb-3 block text-sm font-medium text-gray-700">Parámetro</label>
                                    <div className="relative z-10">
                                        <Select
                                            value={selectedParameter}
                                            onValueChange={setSelectedParameter}
                                            placeholder="Seleccione un parámetro"
                                            disabled={!selectedStation || loading}
                                        >
                                            {parameters.map((param) => (
                                                <SelectItem
                                                    key={param.id}
                                                    value={param.id}
                                                >
                                                    {param.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                </div>

                                <div className="relative">
                                    <label className="mb-3 block text-sm font-medium text-gray-700">Periodo</label>
                                    <div className="relative z-10">
                                        <AdminDateSelector
                                            selectedDate={selectedDate}
                                            onSelect={setSelectedDate}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Carga de Archivo */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Archivos de Datos</h2>

                            {/* Archivo de Mediciones */}
                            <div className="space-y-4">
                                <h3 className="text-md font-medium text-gray-700">Mediciones</h3>
                                <div className="relative z-0">
                                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                            <Upload className="mb-3 h-8 w-8 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click para seleccionar archivo de mediciones</span>
                                            </p>
                                            <p className="text-xs text-gray-500">XLSX, XLS (MAX. 10MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx,.xls"
                                            onChange={handleFileUpload}
                                            disabled={loading}
                                        />
                                    </label>
                                    {file && <p className="mt-2 text-sm text-gray-500">Archivo de mediciones: {file.name}</p>}
                                </div>
                            </div>

                            {/* Archivo de Declaraciones */}
                            <div className="space-y-4">
                                <h3 className="text-md font-medium text-gray-700">Declaraciones de Conformidad</h3>
                                <div className="relative z-0">
                                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                            <Upload className="mb-3 h-8 w-8 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click para seleccionar archivo de declaraciones</span>
                                            </p>
                                            <p className="text-xs text-gray-500">XLSX, XLS (MAX. 10MB)</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".xlsx,.xls"
                                            onChange={handleDeclarationFileUpload}
                                            disabled={loading}
                                        />
                                    </label>
                                    {declarationFile && (
                                        <p className="mt-2 text-sm text-gray-500">Archivo de declaraciones: {declarationFile.name}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex justify-end space-x-4 border-t pt-6">
                        <button
                            type="button"
                            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading || !file}
                        >
                            {loading ? "Cargando..." : "Cargar Datos"}
                        </button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default DataUploadPage;
