import { useTheme } from "@/hooks/use-theme";
import { Bell, ChevronsLeft, Moon, Search, Sun, ChevronRight } from "lucide-react";
import profileImg from "@/assets/profile-image.png";
import PropTypes from "prop-types";
import { Menu, Transition, Popover } from "@headlessui/react";
import { Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Importar contexto de autenticación
import { useNotifications } from "@/contexts/NotificationContext"; // Importar contexto de notificaciones

export const Header = ({ collapsed, setCollapsed }) => {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();
    const { logout, user } = useAuth(); // Obtener función de logout del contexto
    const { notifications } = useNotifications(); // Usar el contexto de notificaciones global

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

                {/* Popover de notificaciones */}
                <Popover className="relative">
                    {({ open, close }) => (
                        <>
                            <Popover.Button
                                className={`btn-ghost relative flex size-10 items-center justify-center rounded-full ${notifications.length > 0 ? 'after:absolute after:right-1 after:top-1 after:h-2 after:w-2 after:rounded-full after:bg-red-500 after:content-[""]' : ""}`}
                            >
                                <Bell size={20} />
                            </Popover.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="opacity-0 translate-y-1"
                                enterTo="opacity-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="opacity-100 translate-y-0"
                                leaveTo="opacity-0 translate-y-1"
                            >
                                <Popover.Panel className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800">
                                    <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 dark:border-slate-700">
                                        <h3 className="font-medium text-slate-900 dark:text-white">Notificaciones</h3>
                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                            {notifications.length} nuevas
                                        </span>
                                    </div>

                                    <div className="max-h-80 divide-y divide-slate-200 overflow-y-auto dark:divide-slate-700">
                                        {notifications.length > 0 ? (
                                            notifications.map((notification) => (
                                                <div
                                                    key={notification.id}
                                                    className="flex cursor-pointer items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                    onClick={() => {
                                                        if (notification.action) {
                                                            notification.action();
                                                        }
                                                        close();
                                                    }}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {notification.icon}
                                                        <div>
                                                            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                                                {notification.title}
                                                            </h3>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400">{notification.description}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                                                No hay notificaciones nuevas
                                            </div>
                                        )}
                                    </div>
                                </Popover.Panel>
                            </Transition>
                        </>
                    )}
                </Popover>

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
