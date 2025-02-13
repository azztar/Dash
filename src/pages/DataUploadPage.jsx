import React, { useState, useEffect } from "react";
import { Card, Select, SelectItem, DatePicker } from "@tremor/react";
import { es } from "date-fns/locale";

const DataUploadPage = () => {
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);
    const [selectedStation, setSelectedStation] = useState(null);
    const [stations, setStations] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [measurements, setMeasurements] = useState([]);
    const [conformityData, setConformityData] = useState([]);

    // Cargar clientes al montar el componente
    useEffect(() => {
        loadClients();
    }, []);

    // Cargar estaciones cuando se selecciona un cliente
    useEffect(() => {
        if (selectedClient) {
            loadStations(selectedClient);
        }
    }, [selectedClient]);

    return (
        <div className="space-y-6 p-6">
            <h1 className="mb-6 text-2xl font-bold">Carga de Mediciones</h1>

            <Card>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Selector de Cliente */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">Cliente</label>
                        <Select
                            value={selectedClient}
                            onValueChange={setSelectedClient}
                            placeholder="Seleccione un cliente"
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

                    {/* Selector de Estación */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">Estación</label>
                        <Select
                            value={selectedStation}
                            onValueChange={setSelectedStation}
                            placeholder="Seleccione una estación"
                            disabled={!selectedClient}
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

                    {/* Selector de Fecha */}
                    <div>
                        <label className="mb-2 block text-sm font-medium">Periodo</label>
                        <DatePicker
                            locale={es}
                            value={selectedDate}
                            onValueChange={setSelectedDate}
                            placeholder="Seleccione el periodo"
                            maxDate={new Date()}
                        />
                    </div>
                </div>

                {/* Formulario de Mediciones */}
                <div className="mt-6">
                    <h3 className="mb-4 text-lg font-medium">Mediciones de Aire</h3>
                    <div className="overflow-x-auto">{/* Aquí irá el formulario de mediciones */}</div>
                </div>

                {/* Formulario de Declaraciones de Conformidad */}
                <div className="mt-6">
                    <h3 className="mb-4 text-lg font-medium">Declaraciones de Conformidad</h3>
                    <div className="overflow-x-auto">{/* Aquí irá el formulario de declaraciones */}</div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        Guardar
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default DataUploadPage;
