import React from "react";
import PropTypes from "prop-types";

export const PageContainer = ({ children, className = "" }) => {
    return (
        <div className={`min-h-screen bg-slate-100 p-6 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white ${className}`}>
            {children}
        </div>
    );
};

PageContainer.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
};
