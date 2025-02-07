// src/routes/TestPage.jsx
import React, { useEffect, useState } from "react";
import apiClient from "../services/apiService";

const TestPage = () => {
    const [data, setData] = useState([]);
    const [newName, setNewName] = useState("");

    // Cargar datos desde el backend
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await apiClient.get("/test");
                setData(response.data.data);
            } catch (error) {
                console.error("Error al obtener datos:", error);
            }
        };

        fetchData();
    }, []);

    // Insertar un nuevo registro
    const handleAdd = async () => {
        try {
            if (!newName.trim()) {
                alert("El campo 'name' es requerido.");
                return;
            }

            const response = await apiClient.post("/test", { name: newName });
            setData([...data, response.data.data]); // Agregar el nuevo registro a la lista
            setNewName(""); // Limpiar el campo de entrada
        } catch (error) {
            console.error("Error al insertar datos:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-6 transition-colors dark:bg-slate-950">
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-50">Datos desde el Backend</h1>

            {/* Formulario para agregar un nuevo registro */}
            <div className="mb-6">
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre"
                    className="mr-2 rounded-md border p-2"
                />
                <button
                    onClick={handleAdd}
                    className="rounded-md bg-blue-500 px-4 py-2 text-white"
                >
                    Agregar
                </button>
            </div>

            {/* Lista de datos */}
            <ul>
                {data.length === 0 ? (
                    <p>No hay datos disponibles.</p>
                ) : (
                    data.map((item, index) => (
                        <li
                            key={index}
                            className="mb-2"
                        >
                            {item.name}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default TestPage;
