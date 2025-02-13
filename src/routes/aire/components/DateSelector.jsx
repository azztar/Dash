import React from "react";
import { Card } from "@tremor/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";

registerLocale("es", es);

export const DateSelector = ({ selectedDate, onSelect }) => {
    return (
        <Card className="mb-6">
            <h3 className="mb-4 text-lg font-semibold">Seleccionar Mes/Año</h3>
            <DatePicker
                selected={selectedDate}
                onChange={onSelect}
                dateFormat="MM/yyyy"
                showMonthYearPicker
                locale="es"
                className="w-full rounded-md border p-2"
                placeholderText="Seleccione Mes/Año"
            />
        </Card>
    );
};
