"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/providers/theme-provider";

export default function ThemeToggle() {
    const { theme, toggleTheme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Button
            size="icon"
            variant="outline"
            className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={toggleTheme}
            aria-label="Toggle theme"
        >
            {!mounted || theme !== "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>
    );
}
