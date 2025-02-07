const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Ruta protegida
router.get("/api/protected", authMiddleware, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
