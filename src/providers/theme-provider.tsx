"use client";

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps, useTheme } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            {...props}
        >
            {children}
        </NextThemesProvider>
    );
}

export const useThemeStore = () => {
    const { theme, resolvedTheme, setTheme } = useTheme();

    const activeTheme = (resolvedTheme ?? theme ?? "light") as "light" | "dark";

    return {
        theme: activeTheme,
        setTheme,
        toggleTheme: () => setTheme(activeTheme === "dark" ? "light" : "dark"),
    };
};
