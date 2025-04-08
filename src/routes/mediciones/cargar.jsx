import React, { useState, useEffect } from "react";
import { Card, Button, Select, SelectItem } from "@tremor/react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import DatePicker from "@/components/DatePicker";
import { PageContainer } from "@/components/PageContainer";
import { FileUp, Upload } from "lucide-react";

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
    const { user } = useAuth();

    // Cargar clientes al montar componente
    useEffect(() => {
        if (user?.rol === "administrador" || user?.rol === "empleado") {
            loadClients();
        } else if (user?.rol === "cliente") {
            // Si es cliente, autoseleccionar su ID
            setSelectedClient(user.id);
            loadStations(user.id);
        }
    }, [user]);

    // Cargar estaciones cuando cambia cliente seleccionado
    useEffect(() => {
        if (selectedClient) {
            loadStations(selectedClient);
        } else {
            setStations([]);
        }
    }, [selectedClient]);

    // Cargar clientes desde Supabase
    const loadClients = async () => {
        try {
            setLoading(true);

            // Verificar si debemos usar datos simulados
            if (import.meta.env.VITE_USE_MOCK_DATA === "true") {
                console.log("📊 Usando datos simulados para clientes");
                const mockClients = [
                    { id_usuario: "1", nombre_empresa: "Cliente 900900901", nit: "900900901" },
                    { id_usuario: "2", nombre_empresa: "Cliente Prueba", nit: "123456789" },
                ];
                setClients(mockClients);
                return;
            }

            const { data, error } = await supabase.from("usuarios").select("id_usuario, nombre_empresa, nit").eq("rol", "cliente");

            if (error) throw error;
            setClients(data || []);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
            // Datos de fallback en caso de error
            setClients([
                { id_usuario: "1", nombre_empresa: "Cliente 900900901", nit: "900900901" },
                { id_usuario: "2", nombre_empresa: "Cliente Prueba", nit: "123456789" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar estaciones desde Supabase
    const loadStations = async (clientId) => {
        try {
            setLoading(true);

            // Primera opción: intentar cargar desde Supabase
            const { data, error } = await supabase.from("estaciones").select("id_estacion, nombre_estacion").eq("id_usuario", clientId);

            // Si hay error o no hay datos, usar estaciones predefinidas
            if (error || !data || data.length === 0) {
                // Estaciones predefinidas como respaldo
                const defaultStations = [
                    { id_estacion: "1", nombre_estacion: "Estación 1" },
                    { id_estacion: "2", nombre_estacion: "Estación 2" },
                    { id_estacion: "3", nombre_estacion: "Estación 3" },
                    { id_estacion: "4", nombre_estacion: "Estación 4" },
                ];
                setStations(defaultStations);
                return;
            }

            setStations(data);
        } catch (error) {
            console.error("Error al cargar estaciones:", error);
            // Estaciones de respaldo
            const defaultStations = [
                { id_estacion: "1", nombre_estacion: "Estación 1" },
                { id_estacion: "2", nombre_estacion: "Estación 2" },
                { id_estacion: "3", nombre_estacion: "Estación 3" },
                { id_estacion: "4", nombre_estacion: "Estación 4" },
            ];
            setStations(defaultStations);
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

    // Función auxiliar para verificar permisos del usuario actual
    const checkUserPermissions = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return false;

            // Verificar si el usuario tiene rol administrador o empleado
            const { data: userData, error } = await supabase.from("usuarios").select("rol").eq("nit", user.email?.split("@")[0]).single();

            if (error || !userData) return false;

            return ["administrador", "empleado"].includes(userData.rol);
        } catch (e) {
            console.error("Error verificando permisos:", e);
            return false;
        }
    };

    // Función para verificar y crear bucket si no existe
    const checkAndCreateBucket = async (bucketName) => {
        try {
            // Verificar si el bucket existe
            const { data: buckets } = await supabase.storage.listBuckets();
            const bucket = buckets.find((b) => b.name === bucketName);

            if (!bucket) {
                // Si no existe, crearlo
                const { error } = await supabase.storage.createBucket(bucketName, {
                    public: false,
                });

                if (error) throw error;
                console.log(`Bucket '${bucketName}' creado correctamente`);
                return true;
            }

            return true;
        } catch (error) {
            console.error(`Error al verificar/crear bucket '${bucketName}':`, error);
            return false;
        }
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Verificación básica
        if (!selectedClient || !selectedStation || !selectedParameter || !file) {
            toast.error("Por favor complete todos los campos y seleccione un archivo");
            return;
        }

        try {
            setLoading(true);

            // Paso 1: Verificar permisos
            const hasPermission = await checkUserPermissions();
            if (!hasPermission) {
                toast.error("No tiene permisos para subir archivos");
                return;
            }

            // Paso 2: Verificar el tipo de archivo
            const validFileTypes = [".xlsx", ".xls", ".csv"];
            const fileExt = `.${file.name.split(".").pop().toLowerCase()}`;

            if (!validFileTypes.includes(fileExt)) {
                toast.error(`Tipo de archivo no permitido. Use: ${validFileTypes.join(", ")}`);
                return;
            }

            // Paso 3: Intentar la subida del archivo
            console.log("Iniciando subida del archivo...");
            const fileName = `measurement_${Date.now()}_${Math.random().toString(36).substring(2)}`;
            const filePath = `${selectedClient}/${fileName}${fileExt}`;

            // Convertir IDs a enteros antes de la inserción
            const clienteId = parseInt(selectedClient, 10);
            const estacionId = parseInt(selectedStation, 10);
            const normaId = parseInt(selectedParameter, 10);

            if (isNaN(clienteId) || isNaN(estacionId) || isNaN(normaId)) {
                throw new Error("IDs inválidos. Deben ser valores numéricos.");
            }

            // Verificar si el bucket existe
            const { data: buckets } = await supabase.storage.listBuckets();
            const filesBucket = buckets.find((b) => b.name === "files");

            if (!filesBucket) {
                // Si el bucket no existe, intentar crearlo
                const { error: bucketError } = await supabase.storage.createBucket("files", {
                    public: false,
                    allowedMimeTypes: ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
                    fileSizeLimit: 50000000, // 50MB
                });

                if (bucketError) throw new Error(`Error al crear bucket: ${bucketError.message}`);
            }

            const { data: uploadData, error: uploadError } = await supabase.storage.from("files").upload(filePath, file);

            if (uploadError) {
                console.error("Error subiendo archivo:", uploadError);

                if (uploadError.message.includes("bucket")) {
                    toast.error("Error: El bucket 'files' no existe o no tiene permisos");
                } else {
                    toast.error(`Error al subir archivo: ${uploadError.message}`);
                }
                return;
            }

            // Paso 4: Archivo subido con éxito, intentar la inserción en la BD
            console.log("Archivo subido exitosamente, insertando en BD...");

            // Crear un objeto con todos los campos necesarios
            const insertData = {
                id_estacion: estacionId,
                id_norma: normaId,
                id_cliente: clienteId,
                fecha_inicio_muestra: selectedDate.toISOString().split("T")[0],
                archivo_url: filePath,
                muestra: `M-${Date.now().toString().substring(8)}`, // Generar valor para campo obligatorio
            };

            console.log("Datos a insertar:", insertData);

            const { error: insertError } = await supabase.from("mediciones_aire").insert([insertData]);

            if (insertError) {
                console.error("Error al insertar en DB:", insertError);

                // Análisis detallado del error para proporcionar mensajes útiles
                if (insertError.code === "23503") {
                    toast.error("Error: Una o más referencias no existen en la base de datos");
                } else if (insertError.code === "23502") {
                    toast.error("Error: Falta completar campos obligatorios");
                } else if (insertError.code === "42P01") {
                    toast.error("Error: La tabla no existe");
                } else if (insertError.code === "42501") {
                    toast.error("Error: No tiene permisos suficientes para esta acción");
                } else {
                    toast.error(`Error en la base de datos: ${insertError.message}`);
                }
                return;
            }

            toast.success("Mediciones cargadas exitosamente");
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
            <h1 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">Carga de Mediciones y Declaraciones</h1>

            <Card className="dark:bg-slate-800">
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Sección de cliente */}
                    {(user?.rol === "administrador" || user?.rol === "empleado") && (
                        <div>
                            <label className="mb-2 block text-sm font-medium">Cliente</label>
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
                                        {client.nombre_empresa || client.nit}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    )}

                    {/* Resto de los campos del formulario */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Estación</label>
                            <Select
                                value={selectedStation}
                                onValueChange={setSelectedStation}
                                placeholder="Seleccione una estación"
                                disabled={loading || !selectedClient || stations.length === 0}
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

                        <div>
                            <label className="mb-2 block text-sm font-medium">Parámetro</label>
                            <Select
                                value={selectedParameter}
                                onValueChange={setSelectedParameter}
                                placeholder="Seleccione un parámetro"
                                disabled={loading}
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

                    {/* Fecha y archivos */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">Fecha de medición</label>
                        <DatePicker
                            selected={selectedDate}
                            onChange={setSelectedDate}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Archivo de mediciones (.xlsx, .csv)</label>
                        <div className="flex items-center space-x-2">
                            <label className="flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <Upload className="mr-2 h-5 w-5" />
                                Seleccionar archivo
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept=".xlsx,.xls,.csv"
                                    className="hidden"
                                />
                            </label>
                            {file && <span className="text-sm text-gray-500">{file.name}</span>}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium">Declaración de conformidad (opcional)</label>
                        <div className="flex items-center space-x-2">
                            <label className="flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600">
                                <FileUp className="mr-2 h-5 w-5" />
                                Seleccionar archivo
                                <input
                                    type="file"
                                    onChange={handleDeclarationFileUpload}
                                    accept=".pdf,.xlsx,.xls,.csv"
                                    className="hidden"
                                />
                            </label>
                            {declarationFile && <span className="text-sm text-gray-500">{declarationFile.name}</span>}
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading || !selectedClient || !selectedStation || !selectedParameter || !file}
                        className="w-full"
                        variant="primary"
                    >
                        {loading ? "Cargando..." : "Cargar datos"}
                    </Button>
                </form>
            </Card>
        </PageContainer>
    );
};

export default DataUploadPage;
