// src/config/sqlite-config.js
// Versión compatible con navegador para entorno de producción

// Crear un simulador de SQLite para el navegador
const createBrowserSQLite = () => {
    // Almacenamiento en memoria usando localStorage
    const storage = {
        tables: {},

        // Inicializar tabla
        createTable: (tableName, schema) => {
            if (!storage.tables[tableName]) {
                // Intentar cargar datos existentes
                try {
                    const savedData = localStorage.getItem(`sqlite-${tableName}`);
                    storage.tables[tableName] = savedData ? JSON.parse(savedData) : [];
                } catch (e) {
                    storage.tables[tableName] = [];
                }
            }
            return true;
        },

        // Insertar datos
        insert: (tableName, data) => {
            if (!storage.tables[tableName]) {
                storage.createTable(tableName);
            }

            // Generar ID automático
            const id = Date.now() + Math.floor(Math.random() * 10000);
            const record = { id, ...data };

            storage.tables[tableName].push(record);

            // Guardar en localStorage
            try {
                localStorage.setItem(`sqlite-${tableName}`, JSON.stringify(storage.tables[tableName]));
            } catch (e) {
                console.warn("Error guardando en localStorage:", e);
            }

            return { id };
        },

        // Consultar datos
        query: (tableName, filter = null) => {
            if (!storage.tables[tableName]) {
                storage.createTable(tableName);
            }

            if (filter) {
                return storage.tables[tableName].filter(filter);
            }

            return storage.tables[tableName];
        },
    };

    // Objeto simulador de Sequelize
    return {
        authenticate: async () => {
            console.log("✅ Simulador SQLite en navegador inicializado");
            return true;
        },

        query: async (sql, options = {}) => {
            console.log("Consulta SQL simulada:", sql);

            // Simulación muy básica de SQL - solo para pruebas
            if (sql.toLowerCase().includes("create table")) {
                const tableName = sql.match(/create table if not exists (\w+)/i)?.[1];
                if (tableName) {
                    storage.createTable(tableName);
                }
                return [[], true];
            }

            if (sql.toLowerCase().includes("insert into")) {
                const tableName = sql.match(/insert into (\w+)/i)?.[1];
                const values = options.replacements || [];

                if (tableName) {
                    const mockData = {};
                    // Crear objeto de datos mock
                    if (tableName === "archivos") {
                        mockData.nombre_original = values[0] || "archivo.txt";
                        mockData.nombre_archivo = values[1] || "archivo123.txt";
                        mockData.ruta_archivo = values[2] || "/ruta/archivo";
                        mockData.tipo_archivo = values[3] || ".txt";
                        mockData.tamano = values[4] || 1024;
                        mockData.id_usuario = values[5] || 1;
                        mockData.id_cliente = values[6] || 1;
                        mockData.id_estacion = values[7] || null;
                    } else {
                        // Datos genéricos para otras tablas
                        for (let i = 0; i < values.length; i++) {
                            mockData[`field${i}`] = values[i];
                        }
                    }

                    const result = storage.insert(tableName, mockData);
                    return [[result], { insertId: result.id }];
                }
            }

            if (sql.toLowerCase().includes("select")) {
                const tableName = sql.match(/from (\w+)/i)?.[1];
                if (tableName) {
                    const results = storage.query(tableName);
                    return [results, { fields: Object.keys(results[0] || {}) }];
                }
            }

            return [[], {}];
        },

        initTestDB: async () => {
            console.log("Inicializando tablas de prueba en memoria");

            // Crear tablas básicas
            storage.createTable("archivos");
            storage.createTable("usuarios");
            storage.createTable("estaciones");

            // Crear usuario de prueba si no existe
            const users = storage.query("usuarios", (user) => user.nit === "900900900");
            if (users.length === 0) {
                storage.insert("usuarios", {
                    nombre_usuario: "Admin Prueba",
                    email: "900900900@ejemplo.com",
                    contrasena: "password-simulado",
                    rol: "administrador",
                    nombre_empresa: "Empresa de Prueba",
                    nit: "900900900",
                });
                console.log("✅ Usuario de prueba creado");
            }

            return true;
        },
    };
};

// Exportar una versión simulada de Sequelize para entorno de navegador
export default createBrowserSQLite();
