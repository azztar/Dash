const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const db = require("../config/database");

const login = async (req, res) => {
    const connection = await db.getConnection();
    try {
        const { nit, password } = req.body;
        console.log("Intento de login:", { nit });

        const [users] = await connection.query("SELECT * FROM usuarios WHERE nit = ?", [nit]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
            });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.contrasena);

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "Credenciales inválidas",
            });
        }

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

        console.log("Token generado para usuario:", {
            userId: user.id_usuario,
            rol: user.rol,
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id_usuario,
                nombre: user.nombre_usuario,
                rol: user.rol,
                empresa: user.nombre_empresa,
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            success: false,
            message: "Error en el servidor",
        });
    } finally {
        connection.release();
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

const verifyToken = async (req, res) => {
    try {
        // El usuario ya está verificado por el middleware de autenticación
        const user = req.user;
        res.json({
            success: true,
            user: {
                id: user.id_usuario,
                nombre: user.nombre_usuario,
                email: user.email,
                rol: user.rol,
                empresa: user.nombre_empresa,
            },
        });
    } catch (error) {
        console.error("Error en verificación:", error);
        res.status(401).json({
            success: false,
            message: "Token inválido o expirado",
        });
    }
};

module.exports = {
    login,
    verifyToken,
};
