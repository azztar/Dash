import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Configuración para conectarse a MySQL de cPanel
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port: process.env.DB_PORT || 3306,
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: {
        // Para conexiones SSL (si es necesario)
        // ssl: {
        //     require: true,
        //     rejectUnauthorized: false
        // }
    },
});

export default sequelize;
