// src/routes/AdminPage/page.jsx
import React, { useState } from "react";
import { Card } from "@tremor/react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import { PencilLine, Trash, UserPlus } from "lucide-react";

// Datos simulados de usuarios
const usersData = [
    { id: 1, name: "Juan Pérez", email: "juan@example.com", role: "Admin" },
    { id: 2, name: "María Gómez", email: "maria@example.com", role: "Editor" },
    { id: 3, name: "Carlos López", email: "carlos@example.com", role: "Viewer" },
];

const AdminPage = () => {
    const { theme } = useTheme();
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState(usersData);

    // Manejar la eliminación de un usuario
    const handleDeleteUser = (id) => {
        setUsers(users.filter((user) => user.id !== id));
    };

    // Manejar la apertura del modal de edición
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditUserModalOpen(true);
    };

    // Manejar la actualización del rol de un usuario
    const handleUpdateUserRole = (id, newRole) => {
        setUsers(users.map((user) => (user.id === id ? { ...user, role: newRole } : user)));
        setIsEditUserModalOpen(false);
    };

    // Manejar la adición de un nuevo usuario
    const handleAddUser = (newUser) => {
        setUsers([...users, { id: users.length + 1, ...newUser }]);
        setIsAddUserModalOpen(false);
    };

    return (
        <div className={`min-h-screen p-6 transition-colors ${theme === "light" ? "bg-slate-100" : "bg-slate-950"}`}>
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

                {/* Tabla de usuarios */}
                <table className="w-full border-collapse border border-gray-300 text-left dark:border-gray-600 dark:text-white">
                    <thead>
                        <tr className="bg-slate-200 dark:bg-slate-800">
                            <th className="border border-slate-300 p-2 dark:border-slate-700">Nombre</th>
                            <th className="border border-slate-300 p-2 dark:border-slate-700">Email</th>
                            <th className="border border-slate-300 p-2 dark:border-slate-700">Rol</th>
                            <th className="border border-slate-300 p-2 dark:border-slate-700">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="odd:bg-slate-100 even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-800"
                            >
                                <td className="border border-slate-300 p-2 dark:border-slate-700">{user.name}</td>
                                <td className="border border-slate-300 p-2 dark:border-slate-700">{user.email}</td>
                                <td className="border border-slate-300 p-2 dark:border-slate-700">{user.role}</td>
                                <td className="border border-slate-300 p-2 dark:border-slate-700">
                                    <div className="flex items-center gap-x-4">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="text-blue-500 dark:text-blue-600"
                                        >
                                            <PencilLine size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-500"
                                        >
                                            <Trash size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
                                                name: formData.get("name"),
                                                email: formData.get("email"),
                                                role: formData.get("role"),
                                            };
                                            handleAddUser(newUser);
                                        }}
                                        className="mt-4 space-y-4"
                                    >
                                        <input
                                            type="text"
                                            name="name"
                                            placeholder="Nombre"
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
                                        <select
                                            name="role"
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Editor">Editor</option>
                                            <option value="Viewer">Viewer</option>
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
                                            const newRole = formData.get("role");
                                            handleUpdateUserRole(selectedUser.id, newRole);
                                        }}
                                        className="mt-4 space-y-4"
                                    >
                                        <input
                                            type="text"
                                            defaultValue={selectedUser?.name}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            disabled
                                        />
                                        <input
                                            type="email"
                                            defaultValue={selectedUser?.email}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            disabled
                                        />
                                        <select
                                            name="role"
                                            defaultValue={selectedUser?.role}
                                            className="w-full rounded-md border p-2 dark:bg-gray-700 dark:text-white"
                                            required
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Editor">Editor</option>
                                            <option value="Viewer">Viewer</option>
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
