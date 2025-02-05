import { useTheme } from "@/hooks/use-theme";
import { Bell, ChevronsLeft, Moon, Search, Sun, ChevronDown } from "lucide-react";
import profileImg from "@/assets/profile-image.png";
import PropTypes from "prop-types";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();

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
                                {/* Elemento: Mi perfil */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <a
                                            href="/mi-perfil" // Reemplaza con la URL correcta
                                            className={`${
                                                active ? "bg-sky-500 text-white" : "text-slate-900 dark:text-white"
                                            } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                        >
                                            Mi perfil
                                        </a>
                                    )}
                                </Menu.Item>

                                {/* Elemento: Configuración */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <a
                                            href="/configuracion" // Reemplaza con la URL correcta
                                            className={`${
                                                active ? "bg-sky-500 text-white" : "text-slate-900 dark:text-white"
                                            } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                        >
                                            Configuración
                                        </a>
                                    )}
                                </Menu.Item>

                                {/* Elemento: Cerrar sesión */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <a
                                            href="/cerrar-sesion" // Reemplaza con la URL correcta
                                            className={`${
                                                active ? "bg-sky-500 text-white" : "text-slate-900 dark:text-white"
                                            } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                        >
                                            Cerrar sesión
                                        </a>
                                    )}
                                </Menu.Item>

                                {/* Elemento: Ayuda */}
                                <Menu.Item>
                                    {({ active }) => (
                                        <a
                                            href="/ayuda" // Reemplaza con la URL correcta
                                            className={`${
                                                active ? "bg-sky-500 text-white" : "text-slate-900 dark:text-white"
                                            } group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                                        >
                                            Ayuda
                                        </a>
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
