const bcrypt = require("bcrypt");

async function generateHash() {
    const password = "Cliente123"; // Contraseña que quieres usar
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log("Password:", password);
    console.log("Hash generado:", hash);
}

generateHash();
