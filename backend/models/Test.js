// backend/models/Test.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.config");

const Test = sequelize.define("Test", {
    name: {
        type: DataTypes.STRING,
        allowNull: false, // El campo 'name' no puede ser nulo
    },
});

module.exports = Test;
