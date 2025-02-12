import { createContext, useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";

export const ThemeProviderContext = createContext({
    theme: "light",
    setTheme: () => null,
});

export function ThemeProvider({ children, storageKey = "theme", defaultTheme = "light" }) {
    const [theme, setTheme] = useState(() => {
        const storedTheme = localStorage.getItem(storageKey);
        return storedTheme || defaultTheme;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove("light", "dark");
        root.classList.add(theme);
        localStorage.setItem(storageKey, theme);
    }, [theme, storageKey]);

    const value = {
        theme,
        setTheme: useCallback((theme) => {
            setTheme(theme);
        }, []),
    };

    return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

ThemeProvider.propTypes = {
    children: PropTypes.node.isRequired,
    storageKey: PropTypes.string,
    defaultTheme: PropTypes.string,
};
