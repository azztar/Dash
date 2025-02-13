// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/layouts/AuthProvider";
import Layout from "@/routes/layout";
import Login from "@/pages/Login";
import DashboardPage from "@/routes/dashboard/page";
import AnalisisPage from "@/routes/analisis/page";
import AirePage from "@/routes/aire/page";
import ReportsPage from "@/routes/archivos/page";
import AdminPage from "@/routes/adminpage/page";
import SettingsPage from "@/routes/settingspage/page";
import ProtectedRoute from "@/layouts/ProtectedRoute";
import DetalleAire from "@/routes/aire/detalle";

function App() {
    return (
        <ThemeProvider
            storageKey="theme"
            defaultTheme="light"
        >
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Rutas públicas */}
                        <Route
                            path="/login"
                            element={<Login />}
                        />
                        <Route
                            path="/"
                            element={
                                <Navigate
                                    to="/login"
                                    replace
                                />
                            }
                        />

                        {/* Rutas protegidas dentro del Layout */}
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
                                path="/analisis"
                                element={<AnalisisPage />}
                            />
                            {/* <Route path="/analisis_aire" element={<AirePage />} /> */}
                            <Route
                                path="/informe"
                                element={<ReportsPage />}
                            />
                            <Route
                                path="/clientes"
                                element={<AdminPage />}
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
                                path="/aire"
                                element={
                                    <ProtectedRoute>
                                        <AirePage />
                                    </ProtectedRoute>
                                }
                            />
                        </Route>

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
                </BrowserRouter>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
