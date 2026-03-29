import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                heading: ["var(--font-jakarta)", "sans-serif"],
            },
            colors: {
                primary: {
                    50: "#E6F7EF",
                    100: "#C2EEDC",
                    200: "#99E4C7",
                    300: "#66D9AD",
                    400: "#33CF94",
                    500: "#00BF63",
                    600: "#00A956",
                    700: "#008A47",
                    800: "#006C38",
                    900: "#004D28",
                },
            },
        },
    },
};

export default config;
