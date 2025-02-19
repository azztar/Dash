import jwt from "jsonwebtoken";

export const validateMeasurementRequest = (req, res, next) => {
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

    try {
        const fechaValidada = new Date(date);
        if (isNaN(fechaValidada.getTime())) {
            throw new Error("Fecha inválida");
        }
        req.validatedDate = fechaValidada;
    } catch (error) {
        return res.status(400).json({
            error: "Formato de fecha inválido",
            message: "La fecha debe estar en formato ISO 8601",
        });
    }

    next();
};

export const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No se proporcionó token de autenticación",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "tu_clave_secreta");
        req.userData = decoded;
        next();
    } catch (error) {
        console.error("❌ Error de autenticación:", error);
        return res.status(401).json({
            success: false,
            message: "Token inválido o expirado",
        });
    }
};
