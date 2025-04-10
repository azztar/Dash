import React from "react";
import { FileText } from "lucide-react";

export const FileDisplay = ({ file, type = "default" }) => {
    if (!file) return null;

    return (
        <div className="mt-2 flex items-center">
            <FileText className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {type === "declaration" ? "Archivo de declaraciones: " : "Archivo: "}
                {file.name}
                {file.size && `(${(file.size / 1024).toFixed(2)} KB)`}
            </p>
        </div>
    );
};
