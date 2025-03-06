import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { registerLocale } from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "@/hooks/use-theme"; // Importar hook de tema

// Registrar el idioma español
registerLocale("es", es);

export const AdminDateSelector = ({ selectedDate, onSelect }) => {
    const { theme } = useTheme(); // Obtener el tema actual
    const isDarkMode = theme === "dark";

    return (
        <div className="w-full">
            <DatePicker
                selected={selectedDate}
                onChange={onSelect}
                locale="es"
                dateFormat="dd/MM/yyyy"
                maxDate={new Date()}
                showMonthDropdown
                showYearDropdown
                yearDropdownItemNumber={15}
                scrollableYearDropdown
                placeholderText="Seleccione fecha"
                className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                    isDarkMode ? "border-gray-700 bg-gray-800 text-white" : "border-gray-300 bg-white text-gray-900"
                }`}
                wrapperClassName="w-full"
                calendarClassName={`${isDarkMode ? "dark-calendar" : ""} border rounded-lg shadow-lg`}
            />
        </div>
    );
};
