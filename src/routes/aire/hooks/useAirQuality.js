import axios from "axios";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

// Obtener la URL base de la API desde las variables de entorno de Vite
const API_URL = import.meta.env.VITE_API_URL;

export const useAirQuality = () => {
    const { token } = useAuth();
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedNorm, setSelectedNorm] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState({ stations: false, dates: false, measurements: false });
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (!token) return;
        setLoading((prev) => ({ ...prev, stations: true }));
        fetch("/api/stations", { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setStations(data.stations);
                else setError(data.message);
            })
            .catch(() => setError("Error al cargar estaciones"))
            .finally(() => setLoading((prev) => ({ ...prev, stations: false })));
    }, [token]);

    useEffect(() => {
        if (!selectedStation?.id_estacion || !selectedNorm) return;

        setLoading((prev) => ({ ...prev, dates: true }));

        fetch(`${API_URL}/api/measurements/available-dates?stationId=${selectedStation.id_estacion}&parametro=${selectedNorm}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("📅 Respuesta API fechas:", data);

                if (data.success) {
                    // Mantener las fechas como están en la base de datos
                    const fechas = data.dates.map((dateStr) => dateStr);
                    console.log("✅ Fechas disponibles:", fechas);
                    setAvailableDates(fechas);
                } else {
                    console.log("⚠️ No hay fechas disponibles");
                    setAvailableDates([]);
                }
            })
            .catch((error) => {
                console.error("❌ Error al cargar fechas:", error);
                setError("Error al cargar las fechas disponibles");
                setAvailableDates([]);
            })
            .finally(() => {
                setLoading((prev) => ({ ...prev, dates: false }));
            });
    }, [selectedStation, selectedNorm, token]);

    useEffect(() => {
        if (!selectedStation?.id_estacion || !selectedNorm || !selectedDate) return;
        setLoading((prev) => ({ ...prev, measurements: true }));
        fetch(`/api/measurements?stationId=${selectedStation.id_estacion}&parameterId=${selectedNorm}&date=${selectedDate}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) setData(data);
                else setError("Error al obtener mediciones");
            })
            .catch(() => setError("Error al cargar mediciones"))
            .finally(() => setLoading((prev) => ({ ...prev, measurements: false })));
    }, [selectedStation, selectedNorm, selectedDate, token]);

    const handleStationSelect = (station) => {
        setSelectedStation(station);
        setSelectedNorm(null);
        setSelectedDate(null);
        setAvailableDates([]);
    };

    const handleNormSelect = (norm) => {
        setSelectedNorm(norm);
        setSelectedDate(null);
        setAvailableDates([]);
    };

    const handleDateSelect = async (date) => {
        console.log("🎯 handleDateSelect iniciado:", {
            fecha: date,
            tipo: date instanceof Date ? "Date" : typeof date,
        });

        if (!date) {
            setSelectedDate(null);
            return;
        }

        try {
            // Convertir a fecha si es string
            const dateObject = typeof date === "string" ? new Date(date) : date;

            if (!isValid(dateObject)) {
                throw new Error("Fecha inválida");
            }

            const formattedDate = format(dateObject, "yyyy-MM-dd");
            console.log("✅ Fecha formateada:", formattedDate);

            setSelectedDate(dateObject);
            await loadMeasurements(formattedDate);

            setCurrentStep(4);
        } catch (error) {
            console.error("❌ Error procesando fecha:", error);
            setError(`Error: ${error.message}`);
        }
    };

    const loadMeasurements = async (date) => {
        if (!selectedStation?.id_estacion || !selectedNorm || !date) {
            console.log("❌ Faltan datos requeridos:", {
                estacion: selectedStation?.id_estacion,
                norma: selectedNorm,
                fecha: date,
            });
            return;
        }

        setLoading((prev) => ({ ...prev, measurements: true }));

        try {
            const formattedDate = typeof date === "string" ? date : format(date, "yyyy-MM-dd");

            console.log("📊 Consultando mediciones:", {
                estacion: selectedStation.id_estacion,
                parametro: selectedNorm,
                fecha: formattedDate,
            });

            // Corrección: Agregar /api/ en la URL
            const response = await fetch(
                `${API_URL}/api/measurements?` +
                    `stationId=${selectedStation.id_estacion}&` +
                    `parameterId=${selectedNorm}&` +
                    `date=${formattedDate}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (!response.ok) {
                console.error("🔴 Error en la respuesta:", {
                    status: response.status,
                    statusText: response.statusText,
                    url: response.url,
                });
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                console.log("✅ Datos recibidos:", {
                    mediciones: result.data.length,
                    declaracion: Boolean(result.metadata?.declaracionConformidad),
                });
                setData(result);
                setError(null);
            } else {
                throw new Error(result.message || "Error al cargar mediciones");
            }
        } catch (error) {
            console.error("❌ Error cargando mediciones:", error);
            setError(`Error: ${error.message}`);
            setData(null);
        } finally {
            setLoading((prev) => ({ ...prev, measurements: false }));
        }
    };

    return {
        stations,
        selectedStation,
        setSelectedStation: handleStationSelect,
        selectedNorm,
        setSelectedNorm: handleNormSelect,
        selectedDate,
        setSelectedDate: handleDateSelect,
        availableDates,
        data,
        loading,
        error,
        currentStep,
        setCurrentStep,
    };
};
