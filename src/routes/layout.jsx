import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { cn } from "@/utils/cn";
import { Sidebar } from "@/layouts/sidebar";
import { Header } from "@/layouts/header";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useAuth } from "../contexts/AuthContext";

const Layout = () => {
    const isDesktopDevice = useMediaQuery("(min-width: 768px)");
    const [collapsed, setCollapsed] = useState(!isDesktopDevice);
    const sidebarRef = useRef(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        setCollapsed(!isDesktopDevice);
    }, [isDesktopDevice]);

    useClickOutside([sidebarRef], () => {
        if (!isDesktopDevice && !collapsed) {
            setCollapsed(true);
        }
    });

    return (
        <div className="relative min-h-screen">
            <div
                className={cn(
                    "pointer-events-none fixed inset-0 -z-10 bg-black opacity-0 transition-opacity",
                    !collapsed && "max-md:pointer-events-auto max-md:z-50 max-md:opacity-30",
                )}
            />
            <Sidebar
                ref={sidebarRef}
                collapsed={collapsed}
                user={user || {}} // Proporcionar un objeto vacío como fallback
            />
            <main className={cn("min-h-screen transition-[margin] duration-300", collapsed ? "md:ml-[70px]" : "md:ml-[240px]")}>
                <Header
                    collapsed={collapsed}
                    setCollapsed={setCollapsed}
                />
                <div className="h-[calc(100vh-60px)] overflow-y-auto overflow-x-hidden p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
