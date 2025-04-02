import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
// No usar la importación de Card que da error
// import { Card } from "@/components/ui/card";

export const KMZViewer = ({ fileUrl, fileName }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Importación dinámica de las librerías necesarias
        const loadDependencies = async () => {
            try {
                // Importar Leaflet, JSZip y fast-xml-parser dinámicamente
                const [L, JSZip, { XMLParser }] = await Promise.all([
                    import("leaflet").then((module) => module.default || module),
                    import("jszip").then((module) => module.default || module),
                    import("fast-xml-parser"),
                ]);

                // Importar estilos de Leaflet
                import("leaflet/dist/leaflet.css");

                // Cargar iconos de Leaflet
                const icon = (L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.7.1/dist/images/");

                // Arreglar iconos de Leaflet
                delete L.Icon.Default.prototype._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: `${icon}marker-icon-2x.png`,
                    iconUrl: `${icon}marker-icon.png`,
                    shadowUrl: `${icon}marker-shadow.png`,
                });

                return { L, JSZip, XMLParser };
            } catch (err) {
                console.error("Error cargando dependencias:", err);
                throw err;
            }
        };

        const initializeMap = async () => {
            try {
                const { L, JSZip, XMLParser } = await loadDependencies();

                if (!mapInstanceRef.current && mapRef.current) {
                    // Crear el mapa
                    const map = L.map(mapRef.current).setView(
                        [4.624335, -74.063644], // Coordenadas de Bogotá como default
                        10,
                    );

                    // Añadir tile layer (mapa base)
                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    }).addTo(map);

                    mapInstanceRef.current = map;

                    try {
                        await loadKMZFile(fileUrl, map, L, JSZip, XMLParser);
                        setLoading(false);
                    } catch (loadError) {
                        console.error("Error al cargar KMZ:", loadError);
                        setError("No se pudo cargar el archivo KMZ. " + loadError.message);
                        setLoading(false);
                    }
                }
            } catch (err) {
                console.error("Error al inicializar el mapa:", err);
                setError("Error al inicializar el visor de mapas");
                setLoading(false);
            }
        };

        initializeMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [fileUrl]);

    // Función mejorada para cargar y procesar archivos KMZ
    const loadKMZFile = async (url, map, L, JSZip, XMLParser) => {
        try {
            console.log("Cargando archivo KMZ:", url);

            // Añadir reintento automático
            let response = null;
            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries) {
                try {
                    // Usar nuevos parámetros para evitar caché
                    const cacheBuster = `cacheBust=${Date.now()}`;
                    const urlWithCacheBuster = url.includes("?") ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;

                    response = await fetch(urlWithCacheBuster);
                    if (response.ok) break;

                    // Si falla, aumentar contador y esperar antes de reintentar
                    retryCount++;
                    if (retryCount < maxRetries) {
                        console.log(`Intento ${retryCount}/${maxRetries} fallido, reintentando...`);
                        await new Promise((r) => setTimeout(r, 1000)); // Esperar 1 segundo
                    }
                } catch (fetchError) {
                    retryCount++;
                    console.error(`Error en intento ${retryCount}/${maxRetries}:`, fetchError);
                    if (retryCount >= maxRetries) throw fetchError;
                    await new Promise((r) => setTimeout(r, 1000));
                }
            }

            if (!response.ok) {
                let errorDetail = "";
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.message || "";
                } catch {
                    // Si no es JSON, ignorar
                }

                throw new Error(`Error al descargar archivo: ${response.status}${errorDetail ? ` - ${errorDetail}` : ""}`);
            }

            const kmzBlob = await response.blob();
            const zip = new JSZip();

            console.log("Archivo KMZ descargado, descomprimiendo...");

            // Descomprimir KMZ (que es un ZIP con KML dentro)
            const zipContent = await zip.loadAsync(kmzBlob);

            // Buscar el archivo KML dentro del ZIP
            let kmlFile = null;
            let kmlContent = null;

            // Recorrer archivos del ZIP buscando KML
            for (const filename in zipContent.files) {
                if (filename.toLowerCase().endsWith(".kml")) {
                    console.log("Archivo KML encontrado:", filename);
                    kmlFile = zipContent.files[filename];
                    break;
                }
            }

            if (!kmlFile) {
                throw new Error("No se encontró un archivo KML dentro del KMZ");
            }

            // Extraer contenido KML
            kmlContent = await kmlFile.async("text");

            // Parsear XML del KML usando DOMParser para mayor compatibilidad
            const parser = new DOMParser();
            const kmlDoc = parser.parseFromString(kmlContent, "text/xml");

            // Verificar si el documento es válido
            if (kmlDoc.documentElement.nodeName === "parsererror") {
                throw new Error("El archivo KML no es un XML válido");
            }

            // También procesar con XMLParser para la estructura de datos
            const xmlParser = new XMLParser({
                ignoreAttributes: false,
                attributeNamePrefix: "@_",
                isArray: (name) => ["Placemark", "Style", "StyleMap", "Folder"].includes(name),
            });

            const kmlData = xmlParser.parse(kmlContent);
            console.log("Datos KML parseados:", kmlData);

            // Procesar datos KML y mostrar en el mapa usando principalmente DOM API
            processKMLWithDOM(kmlDoc, map, L);
        } catch (error) {
            console.error("Error procesando KMZ:", error);
            throw error;
        }
    };

    // Nueva función que procesa el KML usando DOM API para mayor compatibilidad
    const processKMLWithDOM = (kmlDoc, map, L) => {
        try {
            // Obtener todos los placemarks
            const placemarks = kmlDoc.querySelectorAll("Placemark");
            if (placemarks.length === 0) {
                throw new Error("No se encontraron marcadores en el archivo KML");
            }

            console.log(`Encontrados ${placemarks.length} placemarks`);

            // Grupo para todos los marcadores
            const markersGroup = L.featureGroup().addTo(map);

            placemarks.forEach((placemark) => {
                try {
                    // Extraer nombre y descripción
                    const name = placemark.querySelector("name")?.textContent || "Sin nombre";
                    const description = placemark.querySelector("description")?.textContent || "";

                    // Procesar punto (Point)
                    const point = placemark.querySelector("Point");
                    if (point) {
                        const coordinates = point.querySelector("coordinates")?.textContent?.trim();
                        if (coordinates) {
                            const [lon, lat, alt] = coordinates.split(",").map(parseFloat);

                            if (!isNaN(lat) && !isNaN(lon)) {
                                const marker = L.marker([lat, lon]).bindPopup(`<h3>${name}</h3><p>${description}</p>`).addTo(markersGroup);
                            }
                        }
                    }

                    // Procesar línea (LineString)
                    const lineString = placemark.querySelector("LineString");
                    if (lineString) {
                        const coordinates = lineString.querySelector("coordinates")?.textContent?.trim();
                        if (coordinates) {
                            const points = coordinates
                                .split(/\s+/)
                                .filter(Boolean)
                                .map((coord) => {
                                    const [lon, lat] = coord.split(",").map(parseFloat);
                                    return [lat, lon];
                                });

                            if (points.length > 1) {
                                const polyline = L.polyline(points, { color: "blue", weight: 2 })
                                    .bindPopup(`<h3>${name}</h3><p>${description}</p>`)
                                    .addTo(markersGroup);
                            }
                        }
                    }

                    // Procesar polígono (Polygon)
                    const polygon = placemark.querySelector("Polygon");
                    if (polygon) {
                        const outerBoundary = polygon.querySelector("outerBoundaryIs") || polygon.querySelector("OuterBoundaryIs");

                        if (outerBoundary) {
                            const linearRing = outerBoundary.querySelector("LinearRing");
                            const coordinates = linearRing?.querySelector("coordinates")?.textContent?.trim();

                            if (coordinates) {
                                const points = coordinates
                                    .split(/\s+/)
                                    .filter(Boolean)
                                    .map((coord) => {
                                        const [lon, lat] = coord.split(",").map(parseFloat);
                                        return [lat, lon];
                                    });

                                if (points.length > 2) {
                                    const poly = L.polygon(points, { color: "red", weight: 1 })
                                        .bindPopup(`<h3>${name}</h3><p>${description}</p>`)
                                        .addTo(markersGroup);
                                }
                            }
                        }
                    }
                } catch (elemError) {
                    console.warn("Error procesando elemento:", elemError);
                    // Continuar con el siguiente elemento
                }
            });

            // Ajustar la vista al grupo de marcadores
            if (markersGroup.getLayers().length > 0) {
                map.fitBounds(markersGroup.getBounds());
            } else {
                throw new Error("No se pudieron procesar los marcadores en el archivo KML");
            }
        } catch (error) {
            console.error("Error procesando datos KML con DOM:", error);
            throw error;
        }
    };

    return (
        <div className="h-[400px] overflow-hidden rounded-lg border border-gray-200 shadow-sm sm:h-[500px] lg:h-[600px]">
            {error ? (
                <div className="flex h-full w-full items-center justify-center bg-red-50 p-4 text-red-500">
                    <div className="text-center">
                        <h3 className="text-lg font-bold">Error al cargar el archivo</h3>
                        <p>{error}</p>
                        <p className="mt-2 text-sm">Archivo: {fileName || "Desconocido"}</p>
                    </div>
                </div>
            ) : loading ? (
                <div className="flex h-full w-full items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        <p>Cargando mapa...</p>
                    </div>
                </div>
            ) : (
                <div
                    ref={mapRef}
                    className="h-full w-full"
                />
            )}
        </div>
    );
};

KMZViewer.propTypes = {
    fileUrl: PropTypes.string.isRequired,
    fileName: PropTypes.string,
};
