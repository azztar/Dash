import React from "react";
import { DatePicker as TremorDatePicker } from "@tremor/react";
import { es } from "date-fns/locale";

// Exportar DatePicker como exportación con nombre (named export)
export const DatePicker = ({ selectedDate, onChange, className }) => {
    return (
        <div className="w-full">
            <TremorDatePicker
                className={`w-full ${className || ""}`}
                value={selectedDate}
                onValueChange={onChange}
                locale={es}
                placeholder="Seleccione una fecha"
            />
        </div>
    );
};

// También añadir exportación por defecto para compatibilidad
export default DatePicker;
