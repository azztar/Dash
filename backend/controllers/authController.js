const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.login = async (req, res) => {
    try {
        const { nit, password } = req.body;

        // Agregar logs para depuración
        console.log("Datos recibidos:", { nit, password });

        // Buscar usuario por NIT
        const user = await User.findOne({ where: { nit } });

        console.log("Usuario encontrado:", user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuario no encontrado",
            });
        }

        // Verificar contraseña
        const isMatch = await bcrypt.compare(password, user.contrasena); // Cambiado a 'contrasena'

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
                userId: user.id_usuario, // Cambiado a 'id_usuario'
                nit: user.nit,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id_usuario, // Cambiado a 'id_usuario'
                nit: user.nit,
                name: user.nombre_usuario, // Cambiado a 'nombre_usuario'
                email: user.email,
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
