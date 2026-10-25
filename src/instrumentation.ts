/**
 * Next.js instrumentation hook — runs once on server startup.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamic import keeps this server-only code out of the Edge runtime
    const { seedAdmin } = await import("./lib/seedAdmin");
    await seedAdmin();
  }
}
