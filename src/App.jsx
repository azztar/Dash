// src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import AnalisisPage from "./routes/analisis/page";
import ReportsPage from "./routes/Archivos/page";
import AirePage from "./routes/aire/page";
import AdminPage from "./routes/adminpage/page";
import SettingsPage from "./routes/settingspage/page";

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <DashboardPage />,
                },
                {
                    path: "analisis",
                    element: <AnalisisPage />,
                },
                {
                    path: "informe",
                    element: <ReportsPage />,
                },
                {
                    path: "clientes",
                    element: <AdminPage />,
                },
                {
                    path: "clientes_nuevos",
                    element: <h1 className="title">Clientes Nuevos</h1>,
                },

                {
                    path: "analisis_aire",
                    element: <AirePage />,
                },
                /* {
                    path: "inventory",
                    element: <h1 className="title">Inventory</h1>,
                },
                                {
                    path: "servicios",
                    element: <h1 className="title">Products</h1>,
                },*/
                {
                    path: "configuracion",
                    element: <SettingsPage />,
                },
            ],
        },
    ]);
    return (
        <ThemeProvider storageKey="theme">
            <RouterProvider router={router} />
        </ThemeProvider>
    );
}

export default App;
