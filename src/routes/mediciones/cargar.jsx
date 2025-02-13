import React, { useState, useEffect } from "react";
import { Card, Select, SelectItem, DatePicker } from "@tremor/react";
import { es } from "date-fns/locale";
import { clientService } from "@/services/clientService";
import { Upload } from "lucide-react";
import { DateSelector } from "@/components/DateSelector";

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
            const response = await fetch(`/api/clients/${clientId}/stations`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();

            if (data.success) {
                // Si no hay estaciones, crear las predeterminadas
                if (data.data.length === 0) {
                    setStations([
                        { id_estacion: "1", nombre_estacion: "Estación 1" },
                        { id_estacion: "2", nombre_estacion: "Estación 2" },
                        { id_estacion: "3", nombre_estacion: "Estación 3" },
                        { id_estacion: "4", nombre_estacion: "Estación 4" },
                    ]);
                } else {
                    setStations(data.data);
                }
            }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !selectedClient || !selectedStation || !selectedParameter || !selectedDate) {
            alert("Por favor complete todos los campos");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("clientId", selectedClient);
        formData.append("stationId", selectedStation);
        formData.append("parameterId", selectedParameter);
        formData.append("date", selectedDate.toISOString());

        try {
            setLoading(true);
            const response = await fetch("/api/measurements/upload", {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                alert("Datos cargados exitosamente");
                // Limpiar el formulario
                setFile(null);
                setSelectedStation("");
                setSelectedParameter("");
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            console.error("Error al cargar datos:", error);
            alert(error.message || "Error al cargar los datos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="mb-8 text-2xl font-bold">Carga de Mediciones</h1>

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
                                        <DateSelector
                                            selectedDate={selectedDate}
                                            onSelect={setSelectedDate}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Carga de Archivo */}
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900">Archivo de Datos</h2>
                            <div className="relative z-0">
                                {" "}
                                {/* Menor z-index para esta sección */}
                                <div className="flex w-full items-center justify-center">
                                    <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                            <Upload className="mb-3 h-8 w-8 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click para seleccionar</span> o arrastrar y soltar
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
                                </div>
                                {file && <p className="mt-2 text-sm text-gray-500">Archivo seleccionado: {file.name}</p>}
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
