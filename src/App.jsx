// src/App.jsx
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/layouts/AuthProvider"; // Contexto de autenticación
import ProtectedRoute from "@/layouts/ProtectedRoute"; // Ruta protegida
import Layout from "@/routes/layout"; // Layout del dashboard
import DashboardPage from "@/routes/dashboard/page";
import AnalisisPage from "./routes/analisis/page";
import ReportsPage from "./routes/Archivos/page";
import AirePage from "./routes/aire/page";
import AdminPage from "./routes/adminpage/page";
import SettingsPage from "./routes/settingspage/page";
import TestPage from "./routes/TestPage";
import LoginPage from "@/pages/Login"; // Página de inicio de sesión
import RegisterPage from "@/pages/Register"; // Página de registro
import ForgotPasswordPage from "@/pages/ForgotPassword"; // Página de recuperación de contraseña
import ResetPasswordPage from "@/pages/ResetPassword"; // Página de restablecimiento de contraseña

function App() {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Layout />, // Layout del dashboard
            children: [
                // Rutas protegidas
                {
                    index: true,
                    element: (
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "analisis",
                    element: (
                        <ProtectedRoute>
                            <AnalisisPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "informe",
                    element: (
                        <ProtectedRoute>
                            <ReportsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "clientes",
                    element: (
                        <ProtectedRoute>
                            <AdminPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "clientes_nuevos",
                    element: (
                        <ProtectedRoute>
                            <h1 className="title">Clientes Nuevos</h1>
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "analisis_aire",
                    element: (
                        <ProtectedRoute>
                            <AirePage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "configuracion",
                    element: (
                        <ProtectedRoute>
                            <SettingsPage />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: "test",
                    element: (
                        <ProtectedRoute>
                            <TestPage />
                        </ProtectedRoute>
                    ),
                },
            ],
        },

        // Rutas públicas (sin Layout)
        {
            path: "/login",
            element: <LoginPage />,
        },
        {
            path: "/register",
            element: <RegisterPage />,
        },
        {
            path: "/forgot-password",
            element: <ForgotPasswordPage />,
        },
        {
            path: "/reset-password/:token",
            element: <ResetPasswordPage />,
        },

        // Ruta 404 (Not Found)
        {
            path: "*",
            element: <h1 className="title">404 - Página no encontrada</h1>,
        },
    ]);

    return (
        <ThemeProvider storageKey="theme">
            <AuthProvider>
                {" "}
                {/* Proporciona el contexto de autenticación */}
                <RouterProvider router={router} />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
