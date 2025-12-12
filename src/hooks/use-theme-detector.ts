"use client";

import { useEffect, useState } from "react";

export function useThemeDetector() {
    // Initialize with a safe default (false) to match server rendering (hydration matching)
    // Or we can try to guess, but false is safer. ideally we check immediate value if on client.
    const getCurrentTheme = () => typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false;

    const [isDark, setIsDark] = useState(false); // Default to light to match "Paper" feel if unknown

    useEffect(() => {
        setIsDark(getCurrentTheme());

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const themeChangeListener = (e: MediaQueryListEvent) => {
            setIsDark(e.matches);
        };

        mq.addEventListener("change", themeChangeListener);
        return () => mq.removeEventListener("change", themeChangeListener);
    }, []);

    return isDark;
}
