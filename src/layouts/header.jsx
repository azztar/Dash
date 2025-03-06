import { useTheme } from "@/hooks/use-theme";
import { Bell, ChevronsLeft, Moon, Search, Sun } from "lucide-react";
import profileImg from "@/assets/profile-image.png";
import PropTypes from "prop-types";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Importar contexto de autenticación

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const { logout } = useAuth(); // Obtener función de logout del contexto

    // Función para manejar el cierre de sesión
    const handleLogout = () => {
        logout(); // Limpiar token y estado de autenticación
        navigate("/login"); // Redirigir al login
    };

    return (
        <header className="relative z-10 flex h-[60px] items-center justify-between bg-white px-4 shadow-md transition-colors dark:bg-slate-900">
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronsLeft className={collapsed ? "rotate-180" : ""} />
                </button>
                <div className="input">
                    <Search
                        size={20}
                        className="text-slate-300"
                    />
                    <input
                        type="text"
                        name="search"
                        id="search"
                        placeholder="Search..."
                        className="w-full bg-transparent text-slate-900 outline-0 placeholder:text-slate-300 dark:text-slate-50"
                    />
                </div>
            </div>
            <div className="flex items-center gap-x-3">
                <button
                    className="btn-ghost size-10"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun
                        size={20}
                        className="dark:hidden"
                    />
                    <Moon
                        size={20}
                        className="hidden dark:block"
                    />
                </button>
                <button className="btn-ghost size-10">
                    <Bell size={20} />
                </button>

                {/* Menú desplegable del perfil */}
                <Menu
                    as="div"
                    className="relative"
                >
                    {/* Botón del menú (imagen de perfil) */}
                    <Menu.Button className="flex items-center gap-x-2 rounded-full focus:outline-none">
                        <img
                            src={profileImg}
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    </Menu.Button>

                    {/* Menú desplegable */}
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
                            <div className="p-1">
                                {/* Elemento: Configuración */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/configuracion"
                                            className={`${
                                                active ? "bg-sky-500 text-white" : "text-slate-900 dark:text-white"
                                            } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                        >
                                            Configuración
                                        </Link>
                                    )}
                                </Menu.Item>

                                {/* Elemento: Cerrar sesión */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <button
                                            onClick={handleLogout}
                                            className={`${
                                                active ? "bg-sky-500 text-white" : "text-slate-900 dark:text-white"
                                            } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                        >
                                            Cerrar sesión
                                        </button>
                                    )}
                                </Menu.Item>

                                {/* Elemento: Ayuda */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <Link
                                            to="/ayuda"
                                            className={`${
                                                active ? "bg-sky-500 text-white" : "text-slate-900 dark:text-white"
                                            } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                        >
                                            Ayuda
                                        </Link>
                                    )}
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            </div>
        </header>
    );
};

Header.propTypes = {
    collapsed: PropTypes.bool,
    setCollapsed: PropTypes.func,
};
