import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                heading: ["var(--font-jakarta)", "sans-serif"],
            },
        },
    },
};

export default config;