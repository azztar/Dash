import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";

export const DateSelector = ({ selectedDate, onSelect }) => {
    return (
        <div className="relative">
            <DatePicker
                selected={selectedDate}
                onChange={onSelect}
                locale={es}
                dateFormat="dd/MM/yyyy"
                className="w-full rounded-lg border border-slate-200 bg-gray-50 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholderText="Seleccione una fecha"
                maxDate={new Date()}
            />
        </div>
    );
};
