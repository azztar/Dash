import { forwardRef } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, FileText, Wind, Users, Settings, Upload, FolderArchive } from "lucide-react";
import logoLight from "@/assets/logo-light.svg";
import logoDark from "@/assets/logo-dark.svg";
import { cn } from "@/utils/cn";
import PropTypes from "prop-types";

// Definir los enlaces de navegación
const navbarLinks = [
    {
        title: "General",
        links: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        title: "Gestión",
        links: [
            {
                label: "Análisis Aire",
                path: "/aire",
                icon: Wind,
            },
            {
                label: "Clientes",
                path: "/clientes",
                icon: Users,
            },
            {
                label: "Archivos",
                path: "/archivos",
                icon: FolderArchive,
            },
            {
                label: "Configuración",
                path: "/configuracion",
                icon: Settings,
            },
        ],
    },
];

export const Sidebar = forwardRef(({ collapsed, user = {} }, ref) => {
    // Filtrar los enlaces según el rol del usuario
    const filteredNavbarLinks = navbarLinks.map((section) => ({
        ...section,
        links: section.links.filter((link) => (link.label === "Clientes" ? user?.rol === "administrador" || user?.rol === "empleado" : true)),
    }));

    return (
        <aside
            ref={ref}
            className={cn(
                "fixed z-[100] flex h-full w-[240px] flex-col overflow-x-hidden border-r border-slate-300 bg-white [transition:_width_300ms_cubic-bezier(0.4,_0,_0.2,_1),_left_300ms_cubic-bezier(0.4,_0,_0.2,_1),_background-color_150ms_cubic-bezier(0.4,_0,_0.2,_1),_border_150ms_cubic-bezier(0.4,_0,_0.2,_1)] dark:border-slate-700 dark:bg-slate-900",
                collapsed ? "md:w-[70px] md:items-center" : "md:w-[240px]",
                collapsed ? "max-md:-left-full" : "max-md:left-0",
            )}
        >
            <div className="flex gap-x-3 p-3">
                <img
                    src={logoLight}
                    alt="Logoipsum"
                    className="dark:hidden"
                />
                <img
                    src={logoDark}
                    alt="Logoipsum"
                    className="hidden dark:block"
                />
                {!collapsed && <p className="text-lg font-medium text-slate-900 transition-colors dark:text-slate-50">Icc Ambiental</p>}
            </div>
            <div className="flex w-full flex-col gap-y-4 overflow-y-auto overflow-x-hidden p-3 [scrollbar-width:_thin]">
                {filteredNavbarLinks.map((navbarLink) => (
                    <nav
                        key={navbarLink.title}
                        className={cn("sidebar-group", collapsed && "md:items-center")}
                    >
                        <p className={cn("sidebar-group-title", collapsed && "md:w-[45px]")}>{navbarLink.title}</p>
                        {navbarLink.links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.path}
                                className={cn("sidebar-item", collapsed && "md:w-[45px]")}
                            >
                                <link.icon
                                    size={22}
                                    className="flex-shrink-0"
                                />
                                {!collapsed && <p className="whitespace-nowrap">{link.label}</p>}
                            </NavLink>
                        ))}
                    </nav>
                ))}
                {(user?.rol === "administrador" || user?.rol === "empleado") && (
                    <NavLink
                        to="/mediciones/cargar"
                        className={cn("sidebar-item", collapsed && "md:w-[45px]")}
                    >
                        <Upload
                            size={22}
                            className="flex-shrink-0"
                        />
                        {!collapsed && <p className="whitespace-nowrap">Cargar Mediciones</p>}
                    </NavLink>
                )}
            </div>
        </aside>
    );
});

Sidebar.displayName = "Sidebar";

Sidebar.propTypes = {
    collapsed: PropTypes.bool,
    user: PropTypes.shape({
        rol: PropTypes.string,
    }),
};

Sidebar.defaultProps = {
    collapsed: false,
    user: {},
};

export default Sidebar;
