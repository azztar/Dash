import React, { memo } from "react";
import { Card } from "@tremor/react";
import { LoadingState } from "./LoadingState";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export const MeasurementsTable = memo(
    ({ data, stationName, parameterName, loading }) => {
        // Logging mejorado
        console.log("🔄 MeasurementsTable:", {
            loading,
            hayDatos: Boolean(data?.data),
            totalMediciones: data?.data?.length || 0,
            estacion: stationName,
            parametro: parameterName,
        });

        if (loading) {
            return <LoadingState />;
        }

        if (!data?.data?.length) {
            return (
                <Card className="p-4">
                    <p className="text-center text-gray-500">
                        No hay datos disponibles para {parameterName} en {stationName}
                    </p>
                </Card>
            );
        }

        const measurements = data.data;
        const declaracion = data.metadata?.declaracionConformidad;

        // Función auxiliar para formatear la fecha
        const formatearFecha = (fecha) => {
            try {
                if (!fecha) return "Fecha no disponible";
                // Asumiendo que fecha viene en formato ISO: "2025-02-21"
                const fechaObj = parseISO(fecha);
                return format(fechaObj, "dd 'de' MMMM yyyy", { locale: es });
            } catch (error) {
                console.error("Error al formatear fecha:", fecha, error);
                return fecha || "Fecha no disponible";
            }
        };

        return (
            <div className="space-y-6">
                <Card className="overflow-hidden">
                    <h3 className="border-b bg-gray-50 p-4 text-lg font-semibold">
                        Mediciones de {parameterName} - {stationName}
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Muestra</th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Hora</th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">T. Muestreo (s)</th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                        Concentración (µg/m³)
                                    </th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Incertidumbre</th>
                                    <th className="bg-gray-50 px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Factor Cobertura</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {measurements
                                    .sort((a, b) => {
                                        // Extraer los números después del punto
                                        const [, aNum] = a.muestra.split(".");
                                        const [, bNum] = b.muestra.split(".");
                                        // Ordenar de menor a mayor
                                        return Number(aNum) - Number(bNum);
                                    })
                                    .map((m) => (
                                        <tr
                                            key={m.id_medicion_aire}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">{m.muestra}</td>
                                            <td className="whitespace-nowrap px-6 py-4">{m.fecha_muestra}</td>
                                            <td className="whitespace-nowrap px-6 py-4">{m.hora_muestra.toLowerCase()}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">
                                                {typeof m.tiempo_muestreo === "number"
                                                    ? m.tiempo_muestreo.toLocaleString("es-CO", {
                                                          minimumFractionDigits: 1,
                                                          maximumFractionDigits: 1,
                                                      })
                                                    : m.tiempo_muestreo}
                                            </td>
                                            <td
                                                className={`whitespace-nowrap px-6 py-4 text-right font-medium ${
                                                    parseFloat(m.concentracion.replace(",", ".")) > data.metadata?.norma?.valor_limite
                                                        ? "text-red-600"
                                                        : "text-green-600"
                                                }`}
                                            >
                                                {m.concentracion}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">{m.u}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right">{m.u_factor_cobertura}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Declaración de Conformidad */}
                {declaracion && (
                    <Card className="overflow-hidden">
                        <h3 className="border-b bg-gray-50 p-4 text-lg font-semibold">Declaración de Conformidad</h3>
                        <div className="p-4">
                            <dl className="grid grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Norma</dt>
                                    <dd className="mt-1 text-lg text-gray-900">{declaracion.norma_ugm3} µg/m³</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Media</dt>
                                    <dd className="mt-1 text-lg text-gray-900">{declaracion.media_concentracion} µg/m³</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Probabilidad</dt>
                                    <dd className="mt-1 text-lg text-gray-900">{declaracion.prob_conformidad}%</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Resultado</dt>
                                    <dd
                                        className={`mt-1 text-lg font-semibold ${
                                            declaracion.regla_decision === "CUMPLE" ? "text-green-600" : "text-red-600"
                                        }`}
                                    >
                                        {declaracion.regla_decision}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </Card>
                )}
            </div>
        );
    },
    // Optimización de la comparación para memo
    (prevProps, nextProps) => {
        const dataChanged =
            prevProps.data?.data?.length === nextProps.data?.data?.length &&
            prevProps.data?.metadata?.declaracionConformidad?.id_declaracion === nextProps.data?.metadata?.declaracionConformidad?.id_declaracion;

        const propsChanged =
            prevProps.stationName === nextProps.stationName &&
            prevProps.parameterName === nextProps.parameterName &&
            prevProps.loading === nextProps.loading;

        return dataChanged && propsChanged;
    },
);
