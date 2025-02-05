import React from "react";

export const Input = ({ className, ...props }) => {
    return (
        <input
            className={`w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none ${className}`}
            {...props}
        />
    );
};
