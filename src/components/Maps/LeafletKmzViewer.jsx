import { useState, useEffect, useRef } from "react";
import { Card, Title, Text, Select, SelectItem } from "@tremor/react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import "leaflet/dist/leaflet.css";
import { FileArchive } from "lucide-react";

// Importaciones estáticas para evitar problemas de carga dinámica
import L from "leaflet";
import JSZip from "jszip";

const LeafletKmzViewer = () => {
    const [kmzFiles, setKmzFiles] = useState([]);
    const [selectedKmz, setSelectedKmz] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const kmlLayerRef = useRef(null);
    const { token } = useAuth();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    // Cargar archivos KMZ disponibles
    useEffect(() => {
        const fetchKmzFiles = async () => {
            if (!token) {
                setError("No hay token de autenticación disponible");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log("Cargando archivos KMZ con token:", token ? "Presente" : "Ausente");

                const url = `${API_URL}/api/files/list`;

                const response = await axios.get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Filtrar solo archivos KMZ/KML
                const kmzFiles =
                    response.data.files?.filter((file) => {
                        const ext = file.tipo_archivo?.toLowerCase();
                        return ext === ".kmz" || ext === ".kml";
                    }) || [];

                console.log("Archivos KMZ/KML encontrados:", kmzFiles.length);
                setKmzFiles(kmzFiles);
            } catch (err) {
                console.error("Error al cargar archivos KMZ:", err);
                setError(`Error al cargar archivos: ${err.message}`);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchKmzFiles();
        }
    }, [token, API_URL]);

    // Inicializar mapa cuando cambia la selección
    useEffect(() => {
        if (!selectedKmz) return;
        if (!mapRef.current) return;

        // Función para inicializar el mapa
        const initMap = () => {
            try {
                console.log("🗺️ Inicializando mapa Leaflet");

                // Si ya existe un mapa, eliminarlo primero
                if (leafletMapRef.current) {
                    leafletMapRef.current.remove();
                    leafletMapRef.current = null;
                }

                // Corregir el problema de los iconos
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                });

                // Crear el mapa
                const map = L.map(mapRef.current).setView([4.57, -74.3], 6);

                // Añadir la capa base de OpenStreetMap
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                }).addTo(map);

                leafletMapRef.current = map;

                // Esperar a que el mapa se renderice completamente
                setTimeout(() => {
                    if (leafletMapRef.current) {
                        leafletMapRef.current.invalidateSize();
                        // Cargar el archivo KMZ
                        loadKmzFile();
                    }
                }, 300);
            } catch (error) {
                console.error("Error al inicializar el mapa:", error);
                setError("Error al inicializar el mapa: " + error.message);
            }
        };

        initMap();
    }, [selectedKmz]);

    // Cargar archivo KMZ
    const loadKmzFile = async () => {
        if (!selectedKmz || !token || !leafletMapRef.current) return;

        try {
            setLoading(true);
            setError(null);

            console.log("Cargando archivo KMZ ID:", selectedKmz);

            // URL para descargar el archivo
            const url = `${API_URL}/api/files/download/${selectedKmz}`;

            // Limpiar capa anterior si existe
            if (kmlLayerRef.current) {
                leafletMapRef.current.removeLayer(kmlLayerRef.current);
                kmlLayerRef.current = null;
            }

            // Obtener el archivo
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.blob();

            // Procesar el archivo KMZ
            const zip = await JSZip.loadAsync(data);

            // Buscar el archivo KML dentro
            const kmlFile = Object.keys(zip.files).find((name) => name.toLowerCase().endsWith(".kml"));

            if (!kmlFile) {
                throw new Error("No se encontró archivo KML dentro del KMZ");
            }

            // Extraer el contenido del KML
            const kmlContent = await zip.file(kmlFile).async("string");

            // Crear un elemento DOM a partir del KML
            const parser = new DOMParser();
            const kmlDoc = parser.parseFromString(kmlContent, "text/xml");

            // Procesar los placemarks
            const placemarks = kmlDoc.querySelectorAll("Placemark");
            console.log("Placemarks encontrados:", placemarks.length);

            // Crear grupo de marcadores
            const markers = L.layerGroup();

            // Crear un bounds para ajustar la vista
            const bounds = L.latLngBounds([]);

            placemarks.forEach((placemark) => {
                const name = placemark.querySelector("name")?.textContent || "Sin nombre";

                // Procesar puntos
                const point = placemark.querySelector("Point");
                if (point) {
                    const coordsElem = point.querySelector("coordinates");
                    if (coordsElem) {
                        const coords = coordsElem.textContent.trim();
                        const [lon, lat] = coords.split(",").map(parseFloat);

                        if (!isNaN(lat) && !isNaN(lon)) {
                            const marker = L.marker([lat, lon]).bindPopup(name);
                            markers.addLayer(marker);

                            // Expandir los límites
                            bounds.extend([lat, lon]);
                        }
                    }
                }

                // Procesar polígonos (se podría añadir más adelante)
            });

            // Añadir marcadores al mapa
            markers.addTo(leafletMapRef.current);
            kmlLayerRef.current = markers;

            // Ajustar la vista si hay puntos
            if (bounds.isValid()) {
                leafletMapRef.current.fitBounds(bounds);
                console.log("Vista ajustada a los marcadores");
            }
        } catch (error) {
            console.error("Error al cargar el archivo KMZ:", error);
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full">
            <div className="mb-4">
                <Title>Visualizador Geográfico</Title>
                <Text>Visualiza tus archivos KMZ de ubicaciones</Text>
            </div>

            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Seleccionar archivo geográfico:</label>
                <Select
                    value={selectedKmz}
                    onValueChange={setSelectedKmz}
                    placeholder="Seleccione un archivo KMZ/KML"
                    disabled={loading || kmzFiles.length === 0}
                >
                    {kmzFiles.map((file) => (
                        <SelectItem
                            key={file.id_archivo}
                            value={file.id_archivo}
                        >
                            {file.nombre_original}
                        </SelectItem>
                    ))}
                </Select>

                {loading && !selectedKmz && <div className="mt-2 text-sm text-gray-500">Cargando archivos...</div>}
                {!loading && kmzFiles.length === 0 && <div className="mt-2 text-sm text-gray-500">No hay archivos geográficos disponibles</div>}
            </div>

            <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                {!selectedKmz ? (
                    <div className="flex h-[400px] items-center justify-center bg-gray-50 dark:bg-gray-800">
                        <div className="text-center">
                            <FileArchive className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-gray-500 dark:text-gray-400">Selecciona un archivo KMZ/KML para visualizar el mapa</p>
                        </div>
                    </div>
                ) : (
                    <div
                        ref={mapRef}
                        style={{ height: "400px", width: "100%" }}
                        className="z-0"
                    />
                )}

                {loading && selectedKmz && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
                        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                )}

                {error && <div className="p-4 text-center text-red-500">{error}</div>}
            </div>
        </Card>
    );
};

export default LeafletKmzViewer;
