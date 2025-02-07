const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Iniciar autenticación con Google
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback de Google
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    // Generar un token JWT
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h", // El token expira en 1 hora
    });
    res.redirect(`/dashboard?token=${token}`); // Redirigir al dashboard con el token
});

module.exports = router;
