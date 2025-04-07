// src/routes/AdminPage/page.jsx
import React, { useState, useEffect } from "react";
import { Card } from "@tremor/react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import { PencilLine, Trash, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { useResponsive } from "@/hooks/useResponsive";
import { supabase } from "@/supabaseClient";

const AdminPage = () => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cargar usuarios desde Supabase
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.from("usuarios").select("*");

            if (error) {
                console.error("Error al cargar usuarios:", error);
                // Usar datos simulados en desarrollo
                const mockUsers = [
                    {
                        id_usuario: "1",
                        nombre_usuario: "Admin",
                        email: "900900900@ejemplo.com",
                        rol: "administrador",
                        nit: "900900900",
                        nombre_empresa: "ICC Ambiental",
                    },
                    {
                        id_usuario: "2",
                        nombre_usuario: "Cliente Test",
                        email: "900900901@ejemplo.com",
                        rol: "cliente",
                        nit: "900900901",
                        nombre_empresa: "Empresa Test",
                    },
                ];
                setUsers(mockUsers);
            } else {
                setUsers(data || []);
            }
        } catch (error) {
            console.error("Error al cargar usuarios:", error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Manejar la eliminación de un usuario
    const handleDeleteUser = async (id) => {
        if (!confirm("¿Está seguro de eliminar este usuario?")) return;

        try {
            const { error } = await supabase.from("usuarios").delete().eq("id_usuario", id);

            if (error) throw error;
            fetchUsers();
            toast.success("Usuario eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            toast.error("Error al eliminar usuario");
        }
    };

    // Manejar la apertura del modal de edición
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditUserModalOpen(true);
    };

    // Manejar la actualización del rol de un usuario
    const handleUpdateUserRole = async (id, newRole) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ role: newRole }),
            });
            if (response.ok) {
                fetchUsers();
                setIsEditUserModalOpen(false);
                toast.success("Usuario actualizado correctamente");
            }
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            toast.error("Error al actualizar usuario");
        }
    };

    // Manejar la adición de un nuevo usuario
    const handleAddUser = async (userData) => {
        try {
            // 1. Registrar el usuario en Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: `${userData.nit}@ejemplo.com`,
                password: userData.contrasena,
            });

            if (authError) throw authError;

            // 2. Agregar datos del usuario en la tabla usuarios
            const { error } = await supabase.from("usuarios").insert([
                {
                    id_usuario: authData.user.id,
                    nombre_usuario: userData.nombre_usuario,
                    email: userData.email,
                    rol: userData.rol,
                    nombre_empresa: userData.nombre_empresa,
                    contacto: userData.contacto,
                    direccion: userData.direccion,
                    nit: userData.nit,
                },
            ]);

            if (error) throw error;

            fetchUsers();
            setIsAddUserModalOpen(false);
            toast.success("Usuario agregado correctamente");
        } catch (error) {
            console.error("Error al agregar usuario:", error);
            toast.error("Error al agregar usuario");
        }
    };

    // Verificar permisos
    if (user?.rol !== "administrador" && user?.rol !== "empleado") {
        return (
            <div className="flex h-screen items-center justify-center">
                <p className="text-red-600">No tiene permisos para acceder a esta página</p>
            </div>
        );
    }

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-100 p-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Administración</h1>

            {/* Título de la página */}
            <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">Administración de Usuarios</h1>

            {/* Tarjeta principal */}
            <Card className="mt-6 h-full w-full bg-white p-6 shadow-md dark:bg-gray-900">
                {/* Botón para agregar nuevo usuario */}
                <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="mb-6 flex items-center gap-x-2 rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                >
                    <UserPlus size={20} />
                    Agregar Usuario
                </button>

                {/* Contenedor responsive para la tabla */}
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                        <div className="overflow-hidden rounded-lg border border-gray-300">
                            <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
                                <thead className="bg-slate-200 dark:bg-slate-800">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            Nombre
                                        </th>
                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            Email
                                        </th>
                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            Empresa
                                        </th>
                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            NIT
                                        </th>
                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            Contacto
                                        </th>
                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            Dirección
                                        </th>
                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            Rol
                                        </th>
                                        <th
                                            scope="col"
                                            className="whitespace-nowrap px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white"
                                        >
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-600 dark:bg-gray-900">
                                    {users.map((user) => (
                                        <tr
                                            key={user.id_usuario}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {user.nombre_usuario}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">{user.email}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {user.nombre_empresa}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">{user.nit}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">{user.contacto}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">{user.direccion}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">{user.rol}</td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="flex items-center gap-x-4">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                                    >
                                                        <PencilLine size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user.id_usuario)}
                                                        className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
                                                    >
                                                        <Trash size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Modal para agregar nuevo usuario */}
            <Transition
                appear
                show={isAddUserModalOpen}
                as={Fragment}
            >
                <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => setIsAddUserModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-50"
                                    >
                                        Agregar Nuevo Usuario
                                    </Dialog.Title>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const newUser = {
                                                nombre_usuario: formData.get("nombre_usuario"),
                                                email: formData.get("email"),
                                                contrasena: formData.get("contrasena"),
                                                rol: formData.get("rol"),
                                                nombre_empresa: formData.get("nombre_empresa"),
                                                contacto: formData.get("contacto"),
                                                direccion: formData.get("direccion"),
                                                nit: formData.get("nit"),
                                            };
                                            handleAddUser(newUser);
                                        }}
                                        className="mt-4 space-y-4"
                                    >
                                        <input
                                            type="text"
                                            name="nombre_usuario"
                                            placeholder="Nombre de Usuario"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            placeholder="Email"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="password"
                                            name="contrasena"
                                            placeholder="Contraseña"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="nombre_empresa"
                                            placeholder="Nombre de la Empresa"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="contacto"
                                            placeholder="Teléfono de Contacto"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="direccion"
                                            placeholder="Dirección"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="nit"
                                            placeholder="NIT"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <select
                                            name="rol"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="administrador">Administrador</option>
                                            <option value="empleado">Empleado</option>
                                            <option value="cliente">Cliente</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                                        >
                                            Agregar
                                        </button>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Modal para editar usuario */}
            <Transition
                appear
                show={isEditUserModalOpen}
                as={Fragment}
            >
                <Dialog
                    as="div"
                    className="relative z-10"
                    onClose={() => setIsEditUserModalOpen(false)}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/30" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-gray-800">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-semibold leading-6 text-slate-900 dark:text-slate-50"
                                    >
                                        Editar Usuario
                                    </Dialog.Title>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            const updatedUser = {
                                                id_usuario: selectedUser.id_usuario,
                                                nombre_empresa: formData.get("nombre_empresa"),
                                                contacto: formData.get("contacto"),
                                                direccion: formData.get("direccion"),
                                                rol: formData.get("rol"),
                                            };
                                            handleUpdateUser(updatedUser);
                                        }}
                                        className="mt-4 space-y-4"
                                    >
                                        <input
                                            type="text"
                                            name="nombre_usuario"
                                            defaultValue={selectedUser?.nombre_usuario}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            disabled
                                        />
                                        <input
                                            type="email"
                                            name="email"
                                            defaultValue={selectedUser?.email}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            disabled
                                        />
                                        <input
                                            type="text"
                                            name="nombre_empresa"
                                            defaultValue={selectedUser?.nombre_empresa}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="contacto"
                                            defaultValue={selectedUser?.contacto}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="direccion"
                                            defaultValue={selectedUser?.direccion}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        />
                                        <input
                                            type="text"
                                            name="nit"
                                            defaultValue={selectedUser?.nit}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            disabled
                                        />
                                        <select
                                            name="rol"
                                            defaultValue={selectedUser?.rol}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="administrador">Administrador</option>
                                            <option value="empleado">Empleado</option>
                                            <option value="cliente">Cliente</option>
                                        </select>
                                        <button
                                            type="submit"
                                            className="w-full rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-700"
                                        >
                                            Actualizar
                                        </button>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default AdminPage;
