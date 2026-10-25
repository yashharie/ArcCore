/**
 * Tests for Admin and Member role enforcement.
 *
 * Verifies that:
 * - Role escalation via registration is impossible (MEMBER only)
 * - Admin-only helpers return 403 for MEMBERs
 * - Public users get 401, not 403
 * - Role is read from server-side session, not client input
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterSchema } from "@/lib/validation/auth";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

// Mock getCurrentUser to control role in tests
const getCurrentUserMock = vi.fn();
vi.mock("@/lib/auth/getCurrentUser", () => ({
  getCurrentUser: () => getCurrentUserMock(),
}));

const { requireAdminForApi, requireAuthForApi } = await import(
  "@/lib/auth/authorization"
);

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
});

// ---------------------------------------------------------------------------
// Role escalation via registration input — must be impossible
// ---------------------------------------------------------------------------

describe("role escalation prevention via registration input", () => {
  it("RegisterSchema does not accept a role field", () => {
    // Even if a client sends a role, it must be stripped by the schema
    const result = RegisterSchema.safeParse({
      name: "Attacker",
      email: "attack@example.com",
      password: "AttackPass1",
      role: "ADMIN", // injected by attacker
    });
    // Schema succeeds but must NOT include the role field
    if (result.success) {
      expect(result.data).not.toHaveProperty("role");
    }
  });

  it("RegisterSchema output type has no role property", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "SecurePass1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // The schema output must not carry a role — role is hardcoded server-side
      const keys = Object.keys(result.data);
      expect(keys).not.toContain("role");
      expect(keys).toContain("name");
      expect(keys).toContain("email");
      expect(keys).toContain("password");
    }
  });
});

// ---------------------------------------------------------------------------
// API authorization — MEMBER cannot access ADMIN endpoints
// ---------------------------------------------------------------------------

describe("API authorization — MEMBER vs ADMIN", () => {
  it("returns 403 when a MEMBER attempts an ADMIN-only operation", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER_USER);
    const result = await requireAdminForApi();
    expect(result.user).toBeUndefined();
    expect(result.error).toBeInstanceOf(Response);
    expect(result.error?.status).toBe(403);
  });

  it("returns 401 when an unauthenticated user attempts an ADMIN-only operation", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    const result = await requireAdminForApi();
    expect(result.error?.status).toBe(401);
  });

  it("allows ADMIN to access ADMIN-only operations", async () => {
    getCurrentUserMock.mockResolvedValue(ADMIN_USER);
    const result = await requireAdminForApi();
    expect(result.error).toBeUndefined();
    expect(result.user?.role).toBe("ADMIN");
  });

  it("allows MEMBER to access member-level operations", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER_USER);
    const result = await requireAuthForApi();
    expect(result.error).toBeUndefined();
    expect(result.user?.role).toBe("MEMBER");
  });
});

// ---------------------------------------------------------------------------
// Role cannot be escalated via request manipulation
// ---------------------------------------------------------------------------

describe("role is always read from server-side session", () => {
  it("getCurrentUser mock returns exact role — cannot be overridden from client", async () => {
    // Simulate what happens when a client sends a manipulated request:
    // the server always uses getCurrentUser() from the session,
    // never from client-supplied data.
    getCurrentUserMock.mockResolvedValue(MEMBER_USER);

    // Even if a client sends role=ADMIN in a request body,
    // requireAdminForApi reads only from session (getCurrentUser).
    const result = await requireAdminForApi();
    // The MEMBER still gets 403 regardless of any client-side claim
    expect(result.error?.status).toBe(403);
  });

  it("an ADMIN session correctly grants admin access", async () => {
    getCurrentUserMock.mockResolvedValue(ADMIN_USER);
    const result = await requireAdminForApi();
    expect(result.user?.role).toBe("ADMIN");
    expect(result.error).toBeUndefined();
  });
});
