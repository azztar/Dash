// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // Añadir useAuth
import Layout from "@/routes/layout";
import Login from "@/pages/Login";
import DashboardPage from "@/routes/dashboard/page";
import AirePage from "@/routes/aire/page";
import ReportsPage from "@/routes/archivos/page";
import AdminPage from "@/routes/adminpage/page";
import SettingsPage from "@/routes/settingspage/page";
import ProtectedRoute from "@/layouts/ProtectedRoute";
import DetalleAire from "@/routes/aire/detalle";
import DataUploadPage from "@/routes/mediciones/cargar";
import { RequireAuth } from "@/components/RequireAuth";
import { ToastContainer } from "react-toastify";
import AdminFiles from "@/routes/archivos/AdminFiles";
import ClientFiles from "@/routes/archivos/ClientFiles";
import { NotificationProvider } from "./contexts/NotificationContext";

function AppRoutes() {
    const { user } = useAuth(); // Obtener el usuario del contexto

    return (
        <ThemeProvider
            storageKey="theme"
            defaultTheme="light"
        >
            <Routes>
                <Route
                    path="/login"
                    element={<Login />}
                />

                {/* Rutas protegidas */}
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        path="/dashboard"
                        element={<DashboardPage />}
                    />
                    <Route
                        path="/aire"
                        element={<AirePage />}
                    />

                    <Route
                        path="/informe"
                        element={<ReportsPage />}
                    />
                    <Route
                        path="/clientes"
                        element={
                            <ProtectedRoute allowedRoles={["administrador", "empleado"]}>
                                <AdminPage />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/configuracion"
                        element={<SettingsPage />}
                    />
                    <Route
                        path="/aire/:estacionId"
                        element={<DetalleAire />}
                    />
                    <Route
                        path="/mediciones/cargar"
                        element={
                            <ProtectedRoute allowedRoles={["administrador", "empleado"]}>
                                <DataUploadPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/archivos"
                        element={
                            <ProtectedRoute>
                                {user?.rol === "administrador" || user?.rol === "empleado" ? <AdminFiles /> : <ClientFiles />}
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* Ruta por defecto */}
                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                {/* Ruta 404 */}
                <Route
                    path="*"
                    element={
                        <div className="flex h-screen items-center justify-center">
                            <h1 className="text-2xl">404 - Página no encontrada</h1>
                        </div>
                    }
                />
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </ThemeProvider>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <AppRoutes />
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
