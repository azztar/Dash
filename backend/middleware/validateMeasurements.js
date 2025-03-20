const validateMeasurementRequest = (req, res, next) => {
    const { stationId, parameterId, date } = req.query;

    console.log("🔍 Validando parámetros de medición:", {
        stationId,
        parameterId,
        date,
        tipo: {
            stationId: typeof stationId,
            parameterId: typeof parameterId,
            date: typeof date,
        },
    });

    if (!stationId || !parameterId || !date) {
        return res.status(400).json({
            error: "Parámetros incompletos",
            message: "Se requieren stationId, parameterId y date",
        });
    }

    // Validar formato de fecha
    try {
        const fechaValidada = new Date(date);
        if (isNaN(fechaValidada.getTime())) {
            throw new Error("Fecha inválida");
        }
        // Almacenar la fecha validada para uso posterior
        req.validatedDate = fechaValidada;
    } catch (error) {
        return res.status(400).json({
            error: "Formato de fecha inválido",
            message: "La fecha debe estar en formato ISO 8601",
        });
    }

    next();
};

module.exports = { validateMeasurementRequest };
