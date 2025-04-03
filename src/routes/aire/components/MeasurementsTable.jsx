import React, { useState, useEffect } from "react";
import { Check, AlertTriangle, Info } from "lucide-react";

// Asegurar que la tabla respete el tema oscuro
export const MeasurementsTable = ({ data, stationName, parameterName }) => {
    const [isMobile, setIsMobile] = useState(false);

    // Detectar si es dispositivo móvil
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener("resize", checkIfMobile);

        return () => {
            window.removeEventListener("resize", checkIfMobile);
        };
    }, []);

    // Estadísticas básicas
    const stats = React.useMemo(() => {
        if (!data?.data?.length) return null;

        const valores = data.data.map((m) => parseFloat(String(m.concentracion || "0").replace(",", ".")));
        const max = Math.max(...valores);
        const min = Math.min(...valores);
        const avg = valores.reduce((a, b) => a + b, 0) / valores.length;
        const valor_limite = parseFloat(String(data.data[0]?.valor_limite || "0").replace(",", "."));
        const cumplimiento = data.data.filter((m) => parseFloat(String(m.concentracion || "0").replace(",", ".")) <= valor_limite).length;
        const porcentajeCumplimiento = valor_limite ? (cumplimiento / data.data.length) * 100 : 100;

        return { max, min, avg, porcentajeCumplimiento };
    }, [data]);

    // Validación de datos
    if (!data?.data || data.data.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center">
                <p className="text-slate-500 dark:text-slate-400">No hay mediciones disponibles</p>
            </div>
        );
    }

    return (
        <div>
            {/* Panel de estadísticas */}
            <div className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
                    <div className="rounded-md bg-white p-2 shadow-sm dark:bg-slate-700">
                        <div className="text-xs uppercase text-slate-500 dark:text-slate-400">Máximo</div>
                        <div className="text-lg font-medium text-blue-600 dark:text-blue-400">{stats?.max?.toString().replace(".", ",")}</div>
                    </div>
                    <div className="rounded-md bg-white p-2 shadow-sm dark:bg-slate-700">
                        <div className="text-xs uppercase text-slate-500 dark:text-slate-400">Mínimo</div>
                        <div className="text-lg font-medium text-blue-600 dark:text-blue-400">{stats?.min?.toString().replace(".", ",")}</div>
                    </div>
                    <div className="rounded-md bg-white p-2 shadow-sm dark:bg-slate-700">
                        <div className="text-xs uppercase text-slate-500 dark:text-slate-400">Valor límite</div>
                        <div className="text-lg font-medium text-blue-600 dark:text-blue-400">{data.data[0]?.valor_limite || "-"}</div>
                    </div>
                    <div className="rounded-md bg-white p-2 shadow-sm dark:bg-slate-700">
                        <div className="text-xs uppercase text-slate-500 dark:text-slate-400">Cumplimiento</div>
                        <div className="text-lg font-medium text-blue-600 dark:text-blue-400">{stats?.porcentajeCumplimiento?.toFixed(0)}%</div>
                    </div>
                </div>
            </div>

            {/* Tabla de mediciones sin ordenación */}
            <div className="overflow-x-auto">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="bg-slate-50 text-left text-sm text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">
                            {/* Columna Muestra */}
                            <th
                                className="whitespace-nowrap p-2 text-left font-medium"
                                style={isMobile ? { width: "33%" } : { width: "12%" }}
                            >
                                Muestra
                            </th>

                            {/* Columna Fecha */}
                            {!isMobile && (
                                <th
                                    className="whitespace-nowrap p-2 text-left font-medium"
                                    style={{ width: "12%" }}
                                >
                                    Fecha
                                </th>
                            )}

                            {/* Columna Hora */}
                            {!isMobile && (
                                <th
                                    className="whitespace-nowrap p-2 text-left font-medium"
                                    style={{ width: "12%" }}
                                >
                                    Hora
                                </th>
                            )}

                            {/* Columna Tiempo Muestreo */}
                            {!isMobile && (
                                <th
                                    className="whitespace-nowrap p-2 text-right font-medium"
                                    style={{ width: "12%" }}
                                >
                                    T. Muestreo
                                </th>
                            )}

                            {/* Columna Concentración */}
                            <th
                                className="whitespace-nowrap p-2 text-right font-medium"
                                style={isMobile ? { width: "34%" } : { width: "12%" }}
                            >
                                Concentración
                            </th>

                            {/* Columnas U y Factor de Cobertura */}
                            {!isMobile && (
                                <>
                                    <th
                                        className="whitespace-nowrap p-2 text-right font-medium"
                                        style={{ width: "10%" }}
                                    >
                                        U
                                    </th>
                                    <th
                                        className="whitespace-nowrap p-2 text-right font-medium"
                                        style={{ width: "15%" }}
                                    >
                                        F. Cobertura
                                    </th>
                                </>
                            )}

                            {/* Columna Estado */}
                            <th
                                className="whitespace-nowrap p-2 text-center font-medium"
                                style={isMobile ? { width: "33%" } : { width: "15%" }}
                            >
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {data.data.map((item, index) => {
                            const valorConcentracion = parseFloat(String(item.concentracion || "0").replace(",", "."));
                            const valorLimite = parseFloat(String(item.valor_limite || "0").replace(",", "."));
                            const isAboveLimit = valorConcentracion > valorLimite;
                            const isNearLimit = valorLimite > 0 && valorConcentracion >= valorLimite * 0.85;

                            return (
                                <tr
                                    key={index}
                                    className={`${index % 2 === 0 ? "" : "bg-slate-50 dark:bg-slate-800/20"} transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20`}
                                >
                                    <td className="whitespace-nowrap p-2 font-medium text-slate-900 dark:text-slate-200">{item.muestra}</td>

                                    {!isMobile && <td className="whitespace-nowrap p-2 text-slate-700 dark:text-slate-300">{item.fecha_muestra}</td>}

                                    {!isMobile && <td className="whitespace-nowrap p-2 text-slate-700 dark:text-slate-300">{item.hora_muestra}</td>}

                                    {!isMobile && (
                                        <td className="whitespace-nowrap p-2 text-right font-mono text-slate-700 dark:text-slate-300">
                                            {item.tiempo_muestreo}
                                        </td>
                                    )}

                                    <td className="whitespace-nowrap p-2 text-right font-mono text-slate-900 dark:text-slate-200">
                                        <span
                                            className={
                                                isAboveLimit
                                                    ? "text-red-600 dark:text-red-400"
                                                    : isNearLimit
                                                      ? "text-amber-600 dark:text-amber-400"
                                                      : ""
                                            }
                                        >
                                            {item.concentracion}
                                        </span>
                                    </td>

                                    {!isMobile && (
                                        <>
                                            <td className="whitespace-nowrap p-2 text-right font-mono text-slate-700 dark:text-slate-300">
                                                {item.u}
                                            </td>
                                            <td className="whitespace-nowrap p-2 text-right font-mono text-slate-700 dark:text-slate-300">
                                                {item.u_factor_cobertura}
                                            </td>
                                        </>
                                    )}

                                    <td className="whitespace-nowrap p-2 text-center">
                                        {isMobile ? (
                                            <div className="flex justify-center">
                                                {isAboveLimit ? (
                                                    <AlertTriangle
                                                        size={16}
                                                        className="text-red-500"
                                                    />
                                                ) : isNearLimit ? (
                                                    <Info
                                                        size={16}
                                                        className="text-amber-500"
                                                    />
                                                ) : (
                                                    <Check
                                                        size={16}
                                                        className="text-green-500"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                {isAboveLimit ? (
                                                    <div className="inline-flex items-center rounded-md bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/20 dark:text-red-400">
                                                        <AlertTriangle
                                                            size={12}
                                                            className="mr-0.5"
                                                        />
                                                        Excede
                                                    </div>
                                                ) : isNearLimit ? (
                                                    <div className="inline-flex items-center rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                                                        <Info
                                                            size={12}
                                                            className="mr-0.5"
                                                        />
                                                        Cercano
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center rounded-md bg-green-50 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                        <Check
                                                            size={12}
                                                            className="mr-0.5"
                                                        />
                                                        Conforme
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot className="bg-slate-50 text-sm dark:bg-slate-800/90">
                        <tr>
                            <td
                                colSpan={isMobile ? 1 : 7}
                                className="p-2 text-right font-medium text-slate-700 dark:text-slate-300"
                            >
                                Valor límite:
                            </td>
                            <td className="whitespace-nowrap p-2 text-right font-mono font-medium text-blue-600 dark:text-blue-400">
                                {data.data[0]?.valor_limite || "-"}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
