const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const User = sequelize.define("User", {
    googleId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
});

module.exports = User;
