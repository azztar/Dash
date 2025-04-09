import React, { useState, useEffect } from "react";
import { Card, Button, Select, SelectItem } from "@tremor/react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import DatePicker from "@/components/DatePicker";
import { PageContainer } from "@/components/PageContainer";
import { FileUp, Upload } from "lucide-react";
import { storageService } from "@/services/storageService";

const Cargar = () => {
    const [clientes, setClientes] = useState([]);
    const [estaciones, setEstaciones] = useState([]);
    const [parametros, setParametros] = useState([]);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [selectedClient, setSelectedClient] = useState("");
    const [selectedStation, setSelectedStation] = useState("");
    const [selectedParameter, setSelectedParameter] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());
    const { user } = useAuth();

    // Cargar clientes (si es administrador)
    useEffect(() => {
        const fetchClientes = async () => {
            if (user?.rol === "administrador") {
                try {
                    // Simulación de datos (reemplazar con llamada API real)
                    setClientes([
                        { id: "1", nombre: "Cliente A" },
                        { id: "2", nombre: "Cliente B" },
                        { id: "3", nombre: "Cliente C" },
                        { id: "900900900", nombre: "Empresa de Prueba" },
                    ]);
                } catch (error) {
                    console.error("Error al cargar clientes:", error);
                    toast.error("Error al cargar la lista de clientes");
                }
            } else if (user) {
                // Si es cliente, solo mostrar su propio ID
                setClientes([{ id: user.id.toString(), nombre: user.empresa || "Mi empresa" }]);
                setSelectedClient(user.id.toString());
            }
        };

        fetchClientes();
    }, [user]);

    // Cargar estaciones cuando se selecciona un cliente
    useEffect(() => {
        const fetchEstaciones = async () => {
            if (selectedClient) {
                try {
                    // Simulación de datos (reemplazar con llamada API real)
                    setEstaciones([
                        { id: "101", nombre: "Estación 1" },
                        { id: "102", nombre: "Estación 2" },
                        { id: "103", nombre: "Estación 3" },
                    ]);
                } catch (error) {
                    console.error("Error al cargar estaciones:", error);
                    toast.error("Error al cargar la lista de estaciones");
                }
            } else {
                setEstaciones([]);
            }
        };

        fetchEstaciones();
    }, [selectedClient]);

    // Cargar parámetros (simulados - reemplazar con datos reales)
    useEffect(() => {
        setParametros([
            { id: "PM10", nombre: "PM10" },
            { id: "PM25", nombre: "PM2.5" },
            { id: "O3", nombre: "Ozono (O₃)" },
            { id: "NO2", nombre: "Dióxido de Nitrógeno (NO₂)" },
            { id: "SO2", nombre: "Dióxido de Azufre (SO₂)" },
            { id: "CO", nombre: "Monóxido de Carbono (CO)" },
        ]);
    }, []);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const resetForm = () => {
        if (user?.rol !== "cliente") {
            setSelectedClient("");
        }
        setSelectedStation("");
        setSelectedParameter("");
        setFile(null);
        // No resetear la fecha, mantener la actual
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedClient || !selectedStation || !selectedParameter || !file) {
            toast.error("Por favor complete todos los campos y seleccione un archivo");
            return;
        }

        try {
            setLoading(true);

            // Validaciones y conversiones de tipos
            console.log("Valores a convertir:", {
                selectedClient,
                selectedStation,
                selectedParameter,
            });

            // Convertir IDs a enteros
            const clienteId = parseInt(selectedClient, 10);
            const estacionId = parseInt(selectedStation, 10);
            // El parámetro podría ser texto (PM10, PM2.5, etc.) o un ID numérico
            const normaId = selectedParameter;

            if (isNaN(clienteId) || isNaN(estacionId)) {
                throw new Error("IDs inválidos. Deben ser valores numéricos.");
            }

            // Usar el servicio de almacenamiento (solo API)
            console.log("Iniciando subida del archivo...");
            const uploadResult = await storageService.uploadFile(file, {
                clienteId,
                estacionId,
                normaId,
                fecha: selectedDate.toISOString().split("T")[0],
            });

            if (!uploadResult.success) {
                throw new Error("Error al subir el archivo");
            }

            console.log(`Archivo subido exitosamente con proveedor: ${uploadResult.provider}`);
            console.log("Resultado de la subida:", uploadResult);

            // Registrar la medición en la base de datos
            console.log("Registrando medición en la base de datos...");

            // Crear un objeto con todos los campos necesarios
            const insertData = {
                id_estacion: estacionId,
                id_norma: normaId,
                id_cliente: clienteId,
                fecha_inicio_muestra: selectedDate.toISOString().split("T")[0],
                archivo_url: uploadResult.fileUrl || uploadResult.filePath,
                muestra: `M-${Date.now().toString().substring(8)}`, // Generar valor para campo obligatorio
            };

            console.log("Datos a insertar:", insertData);

            // Notificar éxito al usuario
            toast.success("Archivo cargado exitosamente");
            resetForm();
        } catch (error) {
            console.error("Error general:", error);
            toast.error(error.message || "Error inesperado. Por favor, intente de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="mx-auto max-w-2xl">
                <Card className="bg-white p-6 shadow-md dark:bg-slate-800">
                    <h2 className="mb-6 text-center text-2xl font-bold text-slate-800 dark:text-white">Cargar Mediciones de Calidad del Aire</h2>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* Selector de Cliente (solo para administradores) */}
                        {user?.rol === "administrador" && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Cliente</label>
                                <Select
                                    value={selectedClient}
                                    onValueChange={setSelectedClient}
                                    placeholder="Seleccionar cliente"
                                    disabled={loading}
                                >
                                    {clientes.map((cliente) => (
                                        <SelectItem
                                            key={cliente.id}
                                            value={cliente.id}
                                        >
                                            {cliente.nombre}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        )}

                        {/* Selector de Estación */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Estación</label>
                            <Select
                                value={selectedStation}
                                onValueChange={setSelectedStation}
                                placeholder="Seleccionar estación"
                                disabled={!selectedClient || loading}
                            >
                                {estaciones.map((estacion) => (
                                    <SelectItem
                                        key={estacion.id}
                                        value={estacion.id}
                                    >
                                        {estacion.nombre}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Selector de Parámetro */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Parámetro</label>
                            <Select
                                value={selectedParameter}
                                onValueChange={setSelectedParameter}
                                placeholder="Seleccionar parámetro"
                                disabled={loading}
                            >
                                {parametros.map((parametro) => (
                                    <SelectItem
                                        key={parametro.id}
                                        value={parametro.id}
                                    >
                                        {parametro.nombre}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        {/* Selector de Fecha */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Fecha</label>
                            <DatePicker
                                date={selectedDate}
                                setDate={setSelectedDate}
                                disabled={loading}
                            />
                        </div>

                        {/* Selector de Archivo */}
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">Archivo de Mediciones</label>
                            <div className="mt-1 flex items-center justify-center rounded-md border-2 border-dashed border-slate-300 p-6 dark:border-slate-600">
                                <div className="space-y-2 text-center">
                                    <FileUp className="mx-auto h-8 w-8 text-slate-500" />
                                    <div className="flex text-sm text-slate-600 dark:text-slate-300">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            <span>Seleccionar archivo</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                accept=".csv,.xlsx,.xls"
                                                onChange={handleFileChange}
                                                disabled={loading}
                                            />
                                        </label>
                                        <p className="pl-1">o arrastre y suelte</p>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Formatos aceptados: .CSV, .XLSX, .XLS (max. 10MB)</p>
                                    {file && (
                                        <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botón de Envío */}
                        <div className="mt-6 flex justify-end">
                            <Button
                                type="submit"
                                color="blue"
                                size="md"
                                icon={Upload}
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white transition duration-300 hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {loading ? "Cargando..." : "Cargar Mediciones"}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </PageContainer>
    );
};

export default Cargar;
