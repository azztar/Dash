const db = require("../config/database");
const bcrypt = require("bcryptjs");

const User = {
    findByNit: async (nit) => {
        try {
            const [rows] = await db.query("SELECT * FROM usuarios WHERE nit = ?", [nit]);
            return rows[0];
        } catch (error) {
            console.error("Error en findByNit:", error);
            throw error;
        }
    },

    findById: async (id) => {
        try {
            const [rows] = await db.query("SELECT * FROM usuarios WHERE id_usuario = ?", [id]);
            return rows[0];
        } catch (error) {
            console.error("Error en findById:", error);
            throw error;
        }
    },

    findAll: async () => {
        try {
            const [rows] = await db.query("SELECT * FROM usuarios");
            return rows;
        } catch (error) {
            console.error("Error en findAll:", error);
            throw error;
        }
    },

    create: async (userData) => {
        try {
            const hashedPassword = await bcrypt.hash(userData.contrasena, 10);
            const [result] = await db.query(
                "INSERT INTO usuarios (nombre_usuario, email, contrasena, rol, nombre_empresa, contacto, direccion, nit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    userData.nombre_usuario,
                    userData.email,
                    hashedPassword,
                    userData.rol,
                    userData.nombre_empresa,
                    userData.contacto,
                    userData.direccion,
                    userData.nit,
                ],
            );
            return result.insertId;
        } catch (error) {
            console.error("Error en create:", error);
            throw error;
        }
    },

    updatePassword: async (userId, password) => {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.query("UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?", [hashedPassword, userId]);
        } catch (error) {
            console.error("Error en updatePassword:", error);
            throw error;
        }
    },

    comparePassword: async (password, hash) => {
        return bcrypt.compare(password, hash);
    },
};

module.exports = User;
