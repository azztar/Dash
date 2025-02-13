import { useState, useEffect } from "react";
import { airQualityService } from "@/services/airQualityService";

export const useAirQuality = () => {
    const [stations, setStations] = useState([]);
    const [selectedStation, setSelectedStation] = useState(null);
    const [selectedNorm, setSelectedNorm] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableDates, setAvailableDates] = useState([]);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Cargar estaciones al montar el componente
    useEffect(() => {
        loadStations();
    }, []);

    // Cargar fechas disponibles cuando se selecciona estación y parámetro
    useEffect(() => {
        if (selectedStation && selectedNorm) {
            loadAvailableDates();
        }
    }, [selectedStation, selectedNorm]);

    // Cargar datos cuando se selecciona fecha
    useEffect(() => {
        if (selectedDate) {
            loadMeasurements();
        }
    }, [selectedDate]);

    const loadStations = async () => {
        try {
            setLoading(true);
            const stationsData = await airQualityService.getStations();
            setStations(stationsData);
        } catch (error) {
            setError("Error al cargar estaciones");
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableDates = async () => {
        try {
            setLoading(true);
            const dates = await airQualityService.getAvailableDates(selectedStation.id_estacion, selectedNorm);
            setAvailableDates(dates);
        } catch (error) {
            setError("Error al cargar fechas disponibles");
        } finally {
            setLoading(false);
        }
    };

    const loadMeasurements = async () => {
        if (!selectedStation || !selectedNorm || !selectedDate) return;

        try {
            setLoading(true);
            const measurements = await airQualityService.getMeasurementsByDate(selectedStation.id_estacion, selectedNorm, selectedDate);
            setData(measurements);
        } catch (error) {
            setError("Error al cargar mediciones");
        } finally {
            setLoading(false);
        }
    };

    return {
        stations,
        selectedStation,
        setSelectedStation,
        selectedNorm,
        setSelectedNorm,
        selectedDate,
        setSelectedDate,
        availableDates,
        data,
        loading,
        error,
    };
};
