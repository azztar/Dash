const { DataTypes } = require("sequelize");
const sequelize = require("../config/database"); // Importa la conexión a la base de datos
const bcrypt = require("bcryptjs");

const User = sequelize.define(
    "User",
    {
        id_usuario: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        nombre_usuario: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        contrasena: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        rol: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nombre_empresa: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contacto: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nit: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        tableName: "usuarios", // Nombre de la tabla en la base de datos
        timestamps: false, // Desactiva los campos `createdAt` y `updatedAt` si no existen en la tabla
    },
);

User.beforeCreate(async (user) => {
    if (user.contrasena) {
        const salt = await bcrypt.genSalt(10);
        user.contrasena = await bcrypt.hash(user.contrasena, salt);
    }
});

module.exports = User;
