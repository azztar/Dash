export const uploadController = {
    handleFileUpload: async (req, res) => {
        try {
            // TODO: Implementar lógica para subir archivos
            res.json({ success: true, message: "Archivo subido correctamente" });
        } catch (error) {
            console.error("❌ Error al subir archivo:", error);
            res.status(500).json({
                success: false,
                message: "Error al subir archivo",
            });
        }
    },
};
