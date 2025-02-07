// backend/controllers/testController.js
const Test = require("../models/Test"); // Importa el modelo Test

exports.createTest = async (req, res) => {
    try {
        const { name } = req.body;

        // Validar que el campo 'name' esté presente
        if (!name) {
            return res.status(400).json({ success: false, message: "El campo 'name' es requerido." });
        }

        // Insertar el registro en la base de datos
        const test = await Test.create({ name });

        // Devolver una respuesta exitosa
        res.json({ success: true, data: test });
    } catch (error) {
        console.error("Error al crear el registro:", error); // Imprime el error en la consola
        res.status(500).json({ success: false, message: "Error al insertar datos." });
    }
};
