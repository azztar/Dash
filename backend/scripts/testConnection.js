require("dotenv").config();
const db = require("../config/database");

async function testConnection() {
    try {
        const connection = await db.getConnection();
        console.log("¡Conexión exitosa a la base de datos!");
        connection.release();
    } catch (error) {
        console.error("Error al conectar:", error);
    } finally {
        process.exit();
    }
}

testConnection();
