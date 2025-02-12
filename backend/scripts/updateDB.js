require("dotenv").config();
const db = require("../config/database");
const bcrypt = require("bcryptjs");

async function hashExistingPasswords() {
    try {
        const [users] = await db.query("SELECT * FROM usuarios");

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.contrasena, 10);
            await db.query("UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?", [hashedPassword, user.id_usuario]);
            console.log(`Contraseña actualizada para usuario: ${user.nombre_usuario}`);
        }

        console.log("Todas las contraseñas han sido actualizadas correctamente");
    } catch (error) {
        console.error("Error al actualizar contraseñas:", error);
        throw error;
    }
}

async function main() {
    try {
        await hashExistingPasswords();
        console.log("Proceso completado.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
