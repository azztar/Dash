// backend/models/File.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const File = sequelize.define("File", {
    fileName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    uploadedBy: {
        type: DataTypes.INTEGER, // ID del usuario que subió el archivo
        allowNull: false,
    },
    uploadDate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

module.exports = File;
