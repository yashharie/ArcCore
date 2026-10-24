/**
 * Mock for the `server-only` package.
 * In the real Next.js runtime, `server-only` throws if imported on the client.
 * In Vitest (Node environment), we just no-op it to allow importing server modules.
 */
export {};
