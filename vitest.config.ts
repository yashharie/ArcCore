import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    // Node environment for server-side auth logic tests.
    environment: "node",
    env: {
      NODE_ENV: "test",
    },
    // Mock packages that only work inside Next.js server runtime
    alias: {
      "server-only": new URL(
        "./src/__tests__/__mocks__/server-only.ts",
        import.meta.url
      ).pathname,
    },
  },
});
