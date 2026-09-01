import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    exclude: ["**/node_modules/**", "**/e2e/**"],
    // Registra los matchers de @testing-library/jest-dom (toBeInTheDocument,
    // etc.) para todos los tests que rendericen componentes (render() de
    // @testing-library/react), no solo los que ya usaban renderHook.
    setupFiles: ["./vitest.setup.ts"],
  },
});
