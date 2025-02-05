import React from "react";

export const Button = ({ children, variant, className, ...props }) => {
    const baseStyles = "px-4 py-2 rounded-md font-medium";
    const variants = {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        outline: "border border-blue-500 text-blue-500 hover:bg-blue-50",
        ghost: "text-blue-500 hover:bg-blue-50",
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant] || ""} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};
