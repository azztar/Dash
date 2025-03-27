const db = require("../config/database");

// Otros métodos que puedas tener...

// Añadir este método para obtener la ubicación del usuario
exports.getUserLocation = async (req, res) => {
    try {
        const userId = req.user.id;

        // Obtener la ubicación del usuario desde la base de datos
        const [users] = await db.query(`SELECT latitude, longitude FROM usuarios WHERE id_usuario = ?`, [userId]);

        if (!users.length || !users[0].latitude || !users[0].longitude) {
            // Ubicación por defecto (ejemplo: Madrid)
            return res.json({
                success: true,
                latitude: 40.416775,
                longitude: -3.70379,
            });
        }

        res.json({
            success: true,
            latitude: users[0].latitude,
            longitude: users[0].longitude,
        });
    } catch (error) {
        console.error("Error al obtener ubicación:", error);
        res.status(500).json({
            success: false,
            message: "Error al obtener ubicación del usuario",
        });
    }
};
