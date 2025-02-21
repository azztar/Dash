import React from "react";
import DatePicker from "react-datepicker"; // Cambiar esta importación
import { registerLocale } from "react-datepicker"; // Agregar esta importación
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";

// Registrar el idioma español
registerLocale("es", es);

export const AdminDateSelector = ({ selectedDate, onSelect }) => {
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                wrapperClassName="w-full"
                calendarClassName="border border-gray-200 rounded-lg shadow-lg"
            />
        </div>
    );
};
