import React from "react";
import { DatePicker } from "@tremor/react";
import { es } from "date-fns/locale";

const DateSelector = ({ selectedDate, onSelect }) => {
    return (
        <div className="w-full">
            <DatePicker
                className="w-full"
                value={selectedDate}
                onValueChange={onSelect}
                locale={es}
                placeholder="Seleccione una fecha"
            />
        </div>
    );
};

// Exportación por defecto
export default DateSelector;
