// backend/routes/authRoutes.js
const express = require("express");
const passport = require("passport");

const router = express.Router();

// Iniciar el proceso de autenticación
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Callback después de la autenticación
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
    res.redirect("/dashboard"); // Redirige al dashboard después de iniciar sesión
});

module.exports = router;
