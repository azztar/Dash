import React from "react";
import { Card } from "@tremor/react";

export const LoadingState = () => (
    <Card className="space-y-4 p-6">
        <div className="animate-pulse space-y-4">
            {/* Encabezado */}
            <div className="h-8 w-1/3 rounded bg-gray-200"></div>

            {/* Tabla simulada */}
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className="flex space-x-4"
                    >
                        <div className="h-4 w-1/6 rounded bg-gray-200"></div>
                        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                        <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                        <div className="h-4 w-1/6 rounded bg-gray-200"></div>
                    </div>
                ))}
            </div>

            {/* Declaración de conformidad simulada */}
            <div className="mt-6 space-y-3">
                <div className="h-6 w-1/4 rounded bg-gray-200"></div>
                <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="space-y-2"
                        >
                            <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </Card>
);
