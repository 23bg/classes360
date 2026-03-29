import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        environment: "jsdom",
        globals: true,
        setupFiles: ["./tests/setup/vitest.setup.ts"],
        include: ["tests/**/*.{test,spec}.{ts,tsx}"],
        exclude: ["node_modules", "dist", ".next", "tests/e2e/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            reportsDirectory: "./coverage",
        },
    },
});
