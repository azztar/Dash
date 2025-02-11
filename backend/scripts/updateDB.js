require("dotenv").config();
const hashExistingPasswords = require("../utils/updatePasswords");
const sequelize = require("../config/database");

async function main() {
    try {
        await sequelize.authenticate();
        console.log("Conexión establecida correctamente.");

        await hashExistingPasswords();

        console.log("Proceso completado.");
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();
