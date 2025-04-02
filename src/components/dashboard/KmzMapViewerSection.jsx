import { useState, useEffect, useRef } from "react";
import { Card, Title, Text, Select, SelectItem } from "@tremor/react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import "leaflet/dist/leaflet.css";
import { FileArchive, Layers } from "lucide-react";
import L from "leaflet";
import JSZip from "jszip";

const KmzMapViewerSection = () => {
    const [kmzFiles, setKmzFiles] = useState([]);
    const [selectedKmz, setSelectedKmz] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const [activeBaseLayer, setActiveBaseLayer] = useState("osm"); // Para recordar la capa base activa
    const mapRef = useRef(null);
    const leafletMapRef = useRef(null);
    const kmlLayerRef = useRef(null);
    const layerControlRef = useRef(null);
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
                const response = await axios.get(`${API_URL}/api/files/list`, {
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

    // Manejar selección de archivo KMZ
    const handleSelectKmz = (value) => {
        setSelectedKmz(value);
        setShowMap(true);

        // Dar tiempo a que se renderice el div del mapa antes de inicializarlo
        setTimeout(() => {
            initMap(value);
        }, 100);
    };

    // Inicializar mapa con capas múltiples
    const initMap = (fileId) => {
        if (!fileId || !mapRef.current) return;

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

            // Definir capas base (sin capa híbrida)
            const baseLayers = {
                OpenStreetMap: L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    maxZoom: 19,
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                }),
                Satelital: L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
                    maxZoom: 19,
                    attribution:
                        "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
                }),
                Topográfico: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
                    maxZoom: 17,
                    attribution:
                        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
                }),
                Oscuro: L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
                    maxZoom: 20,
                    attribution:
                        '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
                }),
            };

            // Manejar el caso en que activeBaseLayer era "Híbrido"
            let selectedBaseLayer = activeBaseLayer;
            if (!baseLayers[selectedBaseLayer]) {
                selectedBaseLayer = "OpenStreetMap";
                setActiveBaseLayer(selectedBaseLayer); // Actualizar la preferencia de capa
            }

            const defaultBaseLayer = baseLayers[selectedBaseLayer];

            const map = L.map(mapRef.current, {
                layers: [defaultBaseLayer], // Inicializar con una capa
                center: [4.57, -74.3],
                zoom: 6,
            });

            // Añadir control de capas
            layerControlRef.current = L.control
                .layers(
                    baseLayers,
                    {},
                    {
                        collapsed: false,
                        position: "topright",
                    },
                )
                .addTo(map);

            // Escuchar cambio de capas para recordar la preferencia
            map.on("baselayerchange", function (e) {
                const layerName = e.name;
                // Guardar preferencia
                setActiveBaseLayer(layerName);
            });

            // Guardar referencia al mapa
            leafletMapRef.current = map;

            // Esperar a que el mapa se renderice completamente
            setTimeout(() => {
                if (leafletMapRef.current) {
                    leafletMapRef.current.invalidateSize();
                    // Cargar el archivo KMZ
                    loadKmzFile(fileId);
                }
            }, 300);
        } catch (error) {
            console.error("Error al inicializar el mapa:", error);
            setError("Error al inicializar el mapa: " + error.message);
        }
    };

    // Cargar archivo KMZ
    const loadKmzFile = async (fileId) => {
        if (!fileId || !token || !leafletMapRef.current) return;

        try {
            setLoading(true);
            setError(null);

            console.log("Cargando archivo KMZ ID:", fileId);

            // URL para descargar el archivo
            const url = `${API_URL}/api/files/download/${fileId}`;

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
                const description = placemark.querySelector("description")?.textContent || "";

                // Procesar puntos
                const point = placemark.querySelector("Point");
                if (point) {
                    const coordsElem = point.querySelector("coordinates");
                    if (coordsElem) {
                        const coords = coordsElem.textContent.trim();
                        const [lon, lat] = coords.split(",").map(parseFloat);

                        if (!isNaN(lat) && !isNaN(lon)) {
                            const marker = L.marker([lat, lon]).bindPopup(`<h3>${name}</h3><p>${description}</p>`);
                            markers.addLayer(marker);

                            // Expandir los límites
                            bounds.extend([lat, lon]);
                        }
                    }
                }

                // Procesar líneas (LineString)
                const lineString = placemark.querySelector("LineString");
                if (lineString) {
                    const coordsElem = lineString.querySelector("coordinates");
                    if (coordsElem) {
                        const coordsText = coordsElem.textContent.trim();
                        const points = coordsText
                            .split(/\s+/)
                            .filter(Boolean)
                            .map((coord) => {
                                const [lon, lat] = coord.split(",").map(parseFloat);
                                return [lat, lon];
                            });

                        if (points.length > 1) {
                            const line = L.polyline(points, { color: "blue", weight: 2 }).bindPopup(`<h3>${name}</h3><p>${description}</p>`);
                            markers.addLayer(line);

                            // Expandir los límites
                            points.forEach((point) => bounds.extend(point));
                        }
                    }
                }

                // Procesar polígonos (Polygon)
                const polygon = placemark.querySelector("Polygon");
                if (polygon) {
                    const outerBoundary = polygon.querySelector("outerBoundaryIs") || polygon.querySelector("OuterBoundaryIs");
                    if (outerBoundary) {
                        const linearRing = outerBoundary.querySelector("LinearRing");
                        if (linearRing) {
                            const coordsElem = linearRing.querySelector("coordinates");
                            if (coordsElem) {
                                const coordsText = coordsElem.textContent.trim();
                                const points = coordsText
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .map((coord) => {
                                        const [lon, lat] = coord.split(",").map(parseFloat);
                                        return [lat, lon];
                                    });

                                if (points.length > 2) {
                                    const poly = L.polygon(points, { color: "red", weight: 1 }).bindPopup(`<h3>${name}</h3><p>${description}</p>`);
                                    markers.addLayer(poly);

                                    // Expandir los límites
                                    points.forEach((point) => bounds.extend(point));
                                }
                            }
                        }
                    }
                }
            });

            // Añadir la capa de datos KMZ como un overlay
            markers.addTo(leafletMapRef.current);
            kmlLayerRef.current = markers;

            // Añadir esta capa al control de capas (si existe)
            if (layerControlRef.current) {
                const selectedFile = kmzFiles.find((f) => f.id_archivo === parseInt(fileId));
                const layerName = selectedFile ? selectedFile.nombre_original : "Datos KMZ";
                layerControlRef.current.addOverlay(markers, layerName);
            }

            // Ajustar la vista si hay puntos
            if (bounds.isValid()) {
                leafletMapRef.current.fitBounds(bounds);
                console.log("Vista ajustada a los marcadores");
            }

            setLoading(false);
        } catch (error) {
            console.error("Error al cargar el archivo KMZ:", error);
            setError(`Error: ${error.message}`);
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Seleccionar archivo geográfico:</label>
                <Select
                    value={selectedKmz}
                    onValueChange={handleSelectKmz}
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

            {showMap && (
                <div className="mt-4">
                    <div className="relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="absolute right-2 top-2 z-[1000] flex items-center rounded-md bg-white/80 px-2 py-1 text-xs dark:bg-gray-800/80">
                            <Layers className="mr-1 h-4 w-4" />
                            <span>Cambiar vista</span>
                        </div>
                        <div
                            ref={mapRef}
                            style={{ height: "500px", width: "100%" }}
                            className="z-0"
                        />

                        {loading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80">
                                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        )}

                        {error && <div className="p-4 text-center text-red-500">{error}</div>}
                    </div>
                </div>
            )}

            {!showMap && !selectedKmz && (
                <div className="mt-4 flex h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
                    <div className="text-center">
                        <FileArchive className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-gray-500 dark:text-gray-400">Selecciona un archivo KMZ/KML para visualizar el mapa</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KmzMapViewerSection;
