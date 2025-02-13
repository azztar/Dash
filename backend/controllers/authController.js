const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/database");

const login = async (req, res) => {
    try {
        const { nit, password } = req.body;

        console.log("Datos recibidos:", { nit, password });

        if (!nit || !password) {
            return res.status(400).json({
                success: false,
                message: "NIT y contraseña son requeridos",
            });
        }

        // Buscar usuario por NIT usando tu estructura de tabla
        const [users] = await db.query("SELECT * FROM usuarios WHERE nit = ?", [nit]);

        console.log("Usuario encontrado:", users[0]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
            });
        }

        const user = users[0];

        // Verificar contraseña usando el campo contrasena
        const isValidPassword = await bcrypt.compare(password, user.contrasena);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
            });
        }

        // Generar token con los campos relevantes
        const token = jwt.sign(
            {
                userId: user.id_usuario,
                nit: user.nit,
                rol: user.rol,
                empresa: user.nombre_empresa,
            },
            process.env.JWT_SECRET,
            { expiresIn: "24h" },
        );

        // Enviar respuesta con los campos de tu estructura
        res.json({
            success: true,
            token,
            user: {
                id: user.id_usuario,
                nit: user.nit,
                nombre: user.nombre_usuario,
                email: user.email,
                rol: user.rol,
                empresa: user.nombre_empresa,
            },
        });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({
            success: false,
            message: "Error en el servidor",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

exports.register = async (req, res) => {
    try {
        const { nit, password, email, name } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { nit } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "El NIT ya está registrado",
            });
        }

        // Crear nuevo usuario
        const user = await User.create({
            nit,
            password,
            email,
            name,
        });

        res.status(201).json({
            success: true,
            message: "Usuario registrado exitosamente",
        });
    } catch (error) {
        console.error("Error en registro:", error);
        res.status(500).json({
            success: false,
            message: "Error en el servidor",
        });
    }
};

exports.validateToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No se proporcionó token",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [users] = await db.query("SELECT * FROM usuarios WHERE id_usuario = ?", [decoded.userId]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id_usuario,
                nit: user.nit,
                nombre: user.nombre_usuario,
                email: user.email,
                rol: user.rol,
            },
        });
    } catch (error) {
        console.error("Error al validar token:", error);
        res.status(401).json({
            success: false,
            message: "Token inválido o expirado",
        });
    }
};

module.exports = {
    login,
};
