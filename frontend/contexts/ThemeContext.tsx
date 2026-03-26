"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
    isDark: boolean;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    isDark: false,
    toggle: () => { },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState(false);

    // On mount, check localStorage or system preference
    useEffect(() => {
        const stored = localStorage.getItem("ojt-theme");
        if (stored === "dark") {
            setIsDark(true);
            document.documentElement.classList.add("dark");
        } else if (stored === "light") {
            setIsDark(false);
            document.documentElement.classList.remove("dark");
        } else {
            // Fallback to system preference
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            setIsDark(prefersDark);
            if (prefersDark) document.documentElement.classList.add("dark");
        }
    }, []);

    const toggle = () => {
        setIsDark((prev) => {
            const next = !prev;
            if (next) {
                document.documentElement.classList.add("dark");
                localStorage.setItem("ojt-theme", "dark");
            } else {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("ojt-theme", "light");
            }
            return next;
        });
    };

    return (
        <ThemeContext.Provider value={{ isDark, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
