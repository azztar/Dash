const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Ruta de login
router.post("/login", authController.login);

// Ruta para validar token
router.get("/validate-token", authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user,
    });
});

router.get("/verify", authMiddleware, authController.verifyToken);

module.exports = router;
