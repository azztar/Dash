const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Acceso no autorizado." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adjunta los datos del usuario a la solicitud
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token inválido." });
    }
};
