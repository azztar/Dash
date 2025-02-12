const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/database");

exports.login = async (req, res) => {
    try {
        const { nit, password } = req.body;
        console.log("Datos recibidos:", { nit });

        // Buscar usuario por NIT usando consulta directa
        const [users] = await db.query("SELECT * FROM usuarios WHERE nit = ?", [nit]);
        const user = users[0];

        console.log("Usuario encontrado:", user ? { id: user.id_usuario, rol: user.rol } : null);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.contrasena);
        console.log("Resultado de comparación:", isMatch);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Contraseña incorrecta",
            });
        }

        // Generar token JWT
        const token = jwt.sign(
            {
                userId: user.id_usuario,
                nit: user.nit,
                rol: user.rol,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id_usuario,
                nit: user.nit,
                nombre: user.nombre_usuario,
                email: user.email,
                rol: user.rol,
            },
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            success: false,
            message: "Error en el servidor",
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
