import { useState, useEffect } from "react";
import { clientService } from "../../services/clientService";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { ErrorMessage } from "../../components/ErrorMessage";

export const CargarArchivos = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setError(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            setError("Por favor seleccione un archivo");
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const formData = new FormData();
            formData.append("file", file);

            await clientService.uploadFile(formData);
            setSuccessMessage("Archivo cargado exitosamente");
            setFile(null);
            // Limpiar el input de archivo
            event.target.reset();
        } catch (error) {
            console.error("Error al cargar archivo:", error);
            setError(error.response?.data?.message || "Error al cargar el archivo");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="mb-6 text-2xl font-bold">Cargar Archivos</h1>

            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {successMessage && <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-700">{successMessage}</div>}

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700">Seleccionar archivo</label>
                    <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".csv,.xlsx,.xls"
                        className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || !file}
                    className={`rounded-lg px-4 py-2 text-white ${loading || !file ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"}`}
                >
                    {loading ? "Cargando..." : "Subir Archivo"}
                </button>
            </form>
        </div>
    );
};
