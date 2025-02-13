import React from "react";
import { Card } from "@tremor/react";

export const ParameterSelector = ({ selectedNorm, onSelect }) => {
    const parameters = ["PM10", "PM2.5", "SO2", "NO2", "O3", "CO"];

    return (
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {parameters.map((norm) => (
                <Card
                    key={norm}
                    onClick={() => onSelect(norm)}
                    className={`cursor-pointer rounded-lg p-6 text-center shadow ${
                        selectedNorm === norm
                            ? "bg-sky-500 text-white dark:bg-sky-600 dark:text-white"
                            : "bg-white hover:bg-slate-200 dark:bg-gray-800 dark:text-white dark:hover:bg-slate-700"
                    }`}
                >
                    <span className="text-xl font-semibold">{norm}</span>
                </Card>
            ))}
        </div>
    );
};
