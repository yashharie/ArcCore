/**
 * Tests for authorization helpers.
 *
 * Tests the role-checking logic directly, mocking getCurrentUser()
 * to return specific user states without a real database.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Set up required env before module imports
process.env.SESSION_SECRET = "test-secret-key-that-is-long-enough-32bytes!";

// ---------------------------------------------------------------------------
// Mock next/navigation (redirect throws in Next.js — simulate that)
// ---------------------------------------------------------------------------
const redirectMock = vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => redirectMock(url),
}));

// ---------------------------------------------------------------------------
// Mock getCurrentUser to control auth state in tests
// ---------------------------------------------------------------------------
const getCurrentUserMock = vi.fn();

vi.mock("@/lib/auth/getCurrentUser", () => ({
  getCurrentUser: () => getCurrentUserMock(),
}));

// Import AFTER mocking
const { requireAuth, requireAdmin, requireAuthForApi, requireAdminForApi } =
  await import("@/lib/auth/authorization");

const MEMBER_USER = {
  id: "user-member",
  name: "Alice",
  email: "alice@example.com",
  role: "MEMBER" as const,
  createdAt: new Date(),
};

const ADMIN_USER = {
  id: "user-admin",
  name: "Bob",
  email: "bob@example.com",
  role: "ADMIN" as const,
  createdAt: new Date(),
};

beforeEach(() => {
  getCurrentUserMock.mockReset();
  redirectMock.mockClear();
});

// ---------------------------------------------------------------------------
// requireAuth
// ---------------------------------------------------------------------------

describe("requireAuth", () => {
  it("returns the user when authenticated", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER_USER);
    const user = await requireAuth();
    expect(user).toEqual(MEMBER_USER);
  });

  it("redirects to /login when unauthenticated", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
  });
});

// ---------------------------------------------------------------------------
// requireAdmin
// ---------------------------------------------------------------------------

describe("requireAdmin", () => {
  it("returns the admin user when authenticated as ADMIN", async () => {
    getCurrentUserMock.mockResolvedValue(ADMIN_USER);
    const user = await requireAdmin();
    expect(user).toEqual(ADMIN_USER);
  });

  it("redirects to /dashboard when authenticated as MEMBER", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER_USER);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("redirects to /login when unauthenticated", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/login");
  });
});

// ---------------------------------------------------------------------------
// requireAuthForApi
// ---------------------------------------------------------------------------

describe("requireAuthForApi", () => {
  it("returns the user when authenticated", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER_USER);
    const result = await requireAuthForApi();
    expect(result.error).toBeUndefined();
    expect(result.user).toEqual(MEMBER_USER);
  });

  it("returns a 401 Response when unauthenticated", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    const result = await requireAuthForApi();
    expect(result.user).toBeUndefined();
    expect(result.error).toBeInstanceOf(Response);
    expect(result.error?.status).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// requireAdminForApi
// ---------------------------------------------------------------------------

describe("requireAdminForApi", () => {
  it("returns the admin user when authenticated as ADMIN", async () => {
    getCurrentUserMock.mockResolvedValue(ADMIN_USER);
    const result = await requireAdminForApi();
    expect(result.user).toEqual(ADMIN_USER);
  });

  it("returns a 403 Response when authenticated as MEMBER", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER_USER);
    const result = await requireAdminForApi();
    expect(result.user).toBeUndefined();
    expect(result.error?.status).toBe(403);
  });

  it("returns a 401 Response when unauthenticated", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    const result = await requireAdminForApi();
    expect(result.error?.status).toBe(401);
  });
});
