// backend/controllers/authController.js
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.googleAuth = async (req, res) => {
    const { code } = req.body;

    try {
        // Intercambiar el código por un token de acceso
        const { data } = await axios.post(
            "https://oauth2.googleapis.com/token",
            {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: process.env.REDIRECT_URI,
                grant_type: "authorization_code",
            },
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            },
        );

        const { access_token } = data;

        // Obtener información del usuario
        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { email, name, sub } = userInfo.data;

        // Buscar o crear el usuario en la base de datos
        let user = await User.findOne({ googleId: sub });
        if (!user) {
            user = new User({ googleId: sub, email, name });
            await user.save();
        }

        // Generar token JWT
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ success: true, token, user });
    } catch (error) {
        console.error("Error en la autenticación:", error);
        res.status(500).json({ success: false, message: "Error en la autenticación." });
    }
};
