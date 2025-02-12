const bcrypt = require("bcryptjs");
const db = require("../config/database");

async function hashExistingPasswords() {
    try {
        const [users] = await db.query("SELECT * FROM usuarios");

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.contrasena, 10);
            await db.query("UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?", [hashedPassword, user.id_usuario]);
            console.log(`Contraseña hasheada para usuario: ${user.nombre_usuario}`);
        }

        console.log("Todas las contraseñas han sido hasheadas correctamente");
    } catch (error) {
        console.error("Error al hashear contraseñas:", error);
        throw error;
    }
}

module.exports = hashExistingPasswords;
