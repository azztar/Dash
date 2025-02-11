const bcrypt = require("bcrypt");
const User = require("../models/User");

async function hashExistingPasswords() {
    try {
        const users = await User.findAll();

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.contrasena, 10);
            await user.update({ contrasena: hashedPassword });
            console.log(`Contraseña hasheada para usuario: ${user.nombre_usuario}`);
        }

        console.log("Todas las contraseñas han sido hasheadas correctamente");
    } catch (error) {
        console.error("Error al hashear contraseñas:", error);
    }
}

module.exports = hashExistingPasswords;
