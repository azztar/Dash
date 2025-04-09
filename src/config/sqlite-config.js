// src/config/sqlite-config.js
const { Sequelize } = require("sequelize");
const path = require("path");

// Crear una instancia de Sequelize con SQLite
const sequelize = new Sequelize({
    dialect: "sqlite",
    storage: path.join(__dirname, "../database.sqlite"), // Archivo de base de datos
    logging: false, // Desactivar logs SQL para pruebas
});

// Función para inicializar la base de datos de prueba
const initTestDB = async () => {
    try {
        // Probar la conexión
        await sequelize.authenticate();
        console.log("✅ Conexión a SQLite establecida correctamente");

        // Crear tablas básicas para pruebas
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS archivos (
        id_archivo INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_original TEXT NOT NULL,
        nombre_archivo TEXT NOT NULL,
        ruta_archivo TEXT NOT NULL,
        tipo_archivo TEXT,
        tamano INTEGER,
        id_usuario INTEGER,
        id_cliente INTEGER,
        id_estacion INTEGER,
        fecha_carga DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_usuario TEXT NOT NULL,
        email TEXT NOT NULL,
        contrasena TEXT NOT NULL,
        rol TEXT DEFAULT 'cliente',
        nombre_empresa TEXT,
        nit TEXT UNIQUE,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS estaciones (
        id_estacion INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_estacion TEXT NOT NULL,
        id_usuario INTEGER,
        numero_estacion INTEGER
      )
    `);

        // Insertar un usuario de prueba si no existe
        const [users] = await sequelize.query('SELECT * FROM usuarios WHERE nit = "900900900"');
        if (users.length === 0) {
            await sequelize.query(`
        INSERT INTO usuarios (nombre_usuario, email, contrasena, rol, nombre_empresa, nit)
        VALUES ('Admin Prueba', '900900900@ejemplo.com', '$2b$10$J9CM0uALEbRqkDJ8XCvGceq4tGkdnZCsL7mzZYS1.fvCLR6riUhAS', 'administrador', 'Empresa de Prueba', '900900900')
      `);
            console.log("✅ Usuario de prueba creado (NIT: 900900900, Contraseña: password)");
        }

        console.log("✅ Base de datos SQLite inicializada correctamente");
        return true;
    } catch (error) {
        console.error("❌ Error inicializando SQLite:", error);
        return false;
    }
};

module.exports = {
    sequelize,
    initTestDB,
    query: async (sql, params) => {
        try {
            return await sequelize.query(sql, {
                replacements: params,
                type: Sequelize.QueryTypes.SELECT,
            });
        } catch (error) {
            console.error("Error en consulta SQLite:", error);
            throw error;
        }
    },
};
