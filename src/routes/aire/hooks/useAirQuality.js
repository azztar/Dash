// Correcciones en useAirQuality.js
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { format, parseISO, isValid } from "date-fns";

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

        fetch(`/api/measurements/dates?stationId=${selectedStation.id_estacion}&parameterId=${selectedNorm}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("📅 Respuesta API fechas:", data);

                if (data.success && Array.isArray(data.dates)) {
                    // Mantener las fechas como strings YYYY-MM-DD sin conversión
                    const fechasFormateadas = data.dates.filter((dateStr) => typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr));

                    console.log("📅 Fechas formateadas:", fechasFormateadas);
                    setAvailableDates(fechasFormateadas);
                } else {
                    setError("Error al cargar fechas");
                }
            })
            .catch(() => setError("Error al cargar las fechas disponibles"))
            .finally(() => setLoading((prev) => ({ ...prev, dates: false })));
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
    const handleDateSelect = (date) => {
        console.log("🎯 handleDateSelect iniciado:", { fecha: date, tipo: typeof date });

        if (!date) {
            console.log("⚠️ Fecha deseleccionada");
            setSelectedDate(null);
            return;
        }

        try {
            let formattedDate;

            // Si la fecha ya viene en formato correcto, la usamos directamente
            if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                formattedDate = date;
            }
            // Si la fecha es un objeto Date, convertirla correctamente a UTC
            else if (date instanceof Date && !isNaN(date.getTime())) {
                formattedDate = date.toISOString().split("T")[0]; // Extraer solo la parte YYYY-MM-DD
            } else {
                throw new Error("Formato de fecha inválido, solo se acepta YYYY-MM-DD.");
            }

            console.log("✅ Fecha procesada correctamente:", formattedDate);
            setSelectedDate(formattedDate);
        } catch (error) {
            console.error("❌ Error procesando fecha:", error);
            setError("Error al procesar la fecha seleccionada.");
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
