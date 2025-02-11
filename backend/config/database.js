const { Sequelize } = require("sequelize");

// Configuración de la base de datos
const sequelize = new Sequelize(
    process.env.DB_NAME, // Nombre de la base de datos
    process.env.DB_USER, // Usuario de la base de datos
    process.env.DB_PASSWORD, // Contraseña de la base de datos
    {
        host: process.env.DB_HOST, // Host de la base de datos
        dialect: "mysql", // Cambia a "postgres" si usas PostgreSQL
        logging: false, // Desactiva los logs de Sequelize si no los necesitas
    },
);

// Prueba la conexión a la base de datos
sequelize
    .authenticate()
    .then(() => {
        console.log("Conexión exitosa a la base de datos.");
    })
    .catch((err) => {
        console.error("Error al conectar a la base de datos:", err.message);
    });

module.exports = sequelize;
