// src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import Layout from "@/routes/layout";
import DashboardPage from "@/routes/dashboard/page";
import AnalisisPage from "./routes/analisis/page"; // Importa la nueva página

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
                    element: <AnalisisPage />, // Usa la nueva página aquí
                },
                {
                    path: "informe",
                    element: <h1 className="title">Informe</h1>,
                },
                {
                    path: "clientes",
                    element: <h1 className="title">Clientes</h1>,
                },
                {
                    path: "clientes_nuevos",
                    element: <h1 className="title">Clientes Nuevos</h1>,
                },
                {
                    path: "servicios",
                    element: <h1 className="title">Products</h1>,
                },
                {
                    path: "new-product",
                    element: <h1 className="title">New Product</h1>,
                },
                {
                    path: "inventory",
                    element: <h1 className="title">Inventory</h1>,
                },
                {
                    path: "configuracion",
                    element: <h1 className="title">Configuración</h1>,
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
