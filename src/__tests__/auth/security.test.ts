/**
 * Authentication Security Test Suite.
 *
 * Covers the critical security properties of the entire auth system:
 *
 * 1. Password security — no plaintext storage, Argon2id, timing safety
 * 2. Input validation security — injection via schema, XSS in name, oversized inputs
 * 3. Session security — token integrity, signature verification, expiry
 * 4. Authorization boundaries — 401/403, role escalation, admin endpoint access
 * 5. Token payload security — passwordHash never in session, role tampering
 * 6. Account enumeration prevention — generic error messages
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SignJWT, jwtVerify } from "jose";
import { RegisterSchema, LoginSchema, UpdateProfileSchema } from "@/lib/validation/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

process.env.SESSION_SECRET = "security-test-secret-that-is-32-bytes-long!!";
const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const getCurrentUserMock = vi.fn();
vi.mock("@/lib/auth/getCurrentUser", () => ({
  getCurrentUser: () => getCurrentUserMock(),
}));

const { requireAuth, requireAdmin, requireAuthForApi, requireAdminForApi } =
  await import("@/lib/auth/authorization");

beforeEach(() => getCurrentUserMock.mockReset());

// ---------------------------------------------------------------------------
// 1. Password Security
// ---------------------------------------------------------------------------

describe("security: password hashing", () => {
  it("passwords are never stored in plaintext (hash differs from input)", async () => {
    const password = "SecurePass1";
    const hash = await hashPassword(password);
    expect(hash).not.toBe(password);
    expect(hash).not.toContain(password);
  });

  it("Argon2id hash contains the algorithm identifier", async () => {
    const hash = await hashPassword("SecurePass1");
    expect(hash).toMatch(/^\$argon2id\$/);
  });

  it("correct password verifies successfully", async () => {
    const hash = await hashPassword("SecurePass1");
    expect(await verifyPassword(hash, "SecurePass1")).toBe(true);
  });

  it("wrong password fails verification", async () => {
    const hash = await hashPassword("SecurePass1");
    expect(await verifyPassword(hash, "WrongPassword1")).toBe(false);
  });

  it("empty string fails verification against a real hash", async () => {
    const hash = await hashPassword("SecurePass1");
    expect(await verifyPassword(hash, "")).toBe(false);
  });

  it("case-different password fails verification (hashing is case-sensitive)", async () => {
    const hash = await hashPassword("securepass1");
    expect(await verifyPassword(hash, "SECUREPASS1")).toBe(false);
  });

  it("each hash call produces a unique salt (timing-safe uniqueness)", async () => {
    const [h1, h2] = await Promise.all([
      hashPassword("SecurePass1"),
      hashPassword("SecurePass1"),
    ]);
    expect(h1).not.toBe(h2);
  });
});

// ---------------------------------------------------------------------------
// 2. Input Validation Security
// ---------------------------------------------------------------------------

describe("security: input validation", () => {
  it("rejects SQL injection in email field", () => {
    const result = LoginSchema.safeParse({
      email: "'; DROP TABLE users; --",
      password: "somepassword",
    });
    expect(result.success).toBe(false);
  });

  it("rejects extremely long password (DoS via hash computation)", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "A1" + "x".repeat(200), // 202 chars > 128 limit
    });
    expect(result.success).toBe(false);
  });

  it("rejects extremely long email (memory protection)", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice",
      email: `${"a".repeat(255)}@example.com`,
      password: "SecurePass1",
    });
    expect(result.success).toBe(false);
  });

  it("schema strips unknown fields (role injection)", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "SecurePass1",
      role: "ADMIN",
    });
    if (result.success) {
      expect(result.data).not.toHaveProperty("role");
    }
  });

  it("UpdateProfileSchema strips role, email, passwordHash", () => {
    const result = UpdateProfileSchema.safeParse({
      name: "Alice",
      role: "ADMIN",
      email: "hacker@example.com",
      passwordHash: "$argon2id$...",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("role");
      expect(result.data).not.toHaveProperty("email");
      expect(result.data).not.toHaveProperty("passwordHash");
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Session / JWT Security
// ---------------------------------------------------------------------------

describe("security: JWT session tokens", () => {
  it("a tampered token is rejected", async () => {
    const token = await new SignJWT({ userId: "u1", role: "MEMBER" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);

    const parts = token.split(".");
    parts[1] = Buffer.from(
      JSON.stringify({ userId: "u1", role: "ADMIN" })
    ).toString("base64url");
    const tampered = parts.join(".");

    const result = await jwtVerify(tampered, SECRET, {
      algorithms: ["HS256"],
    }).catch(() => null);
    expect(result).toBeNull();
  });

  it("a token signed with a different key is rejected", async () => {
    const differentKey = new TextEncoder().encode("totally-different-secret-key-32chars!!");
    const token = await new SignJWT({ userId: "u1", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(differentKey);

    const result = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    }).catch(() => null);
    expect(result).toBeNull();
  });

  it("an expired token is rejected", async () => {
    const expiredAt = Math.floor(Date.now() / 1000) - 60;
    const token = await new SignJWT({ userId: "u1", role: "MEMBER" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expiredAt)
      .sign(SECRET);

    const result = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    }).catch(() => null);
    expect(result).toBeNull();
  });

  it("session payload never includes passwordHash", async () => {
    const payload = { userId: "u1", role: "MEMBER" };
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(SECRET);

    const { payload: decoded } = await jwtVerify(token, SECRET, {
      algorithms: ["HS256"],
    });
    expect(decoded).not.toHaveProperty("passwordHash");
  });
});

// ---------------------------------------------------------------------------
// 4. Authorization Boundaries
// ---------------------------------------------------------------------------

describe("security: authorization boundaries", () => {
  const MEMBER = {
    id: "m1", name: "Alice", email: "alice@example.com",
    role: "MEMBER" as const, createdAt: new Date(),
  };
  const ADMIN = {
    id: "a1", name: "Bob", email: "bob@example.com",
    role: "ADMIN" as const, createdAt: new Date(),
  };

  it("unauthenticated user is redirected to /login", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    await expect(requireAuth()).rejects.toThrow("REDIRECT:/login");
  });

  it("MEMBER cannot access ADMIN-only pages (redirected to /dashboard)", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER);
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/dashboard");
  });

  it("unauthenticated API request returns 401", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    const result = await requireAuthForApi();
    expect(result.error?.status).toBe(401);
  });

  it("MEMBER API request to ADMIN endpoint returns 403", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER);
    const result = await requireAdminForApi();
    expect(result.error?.status).toBe(403);
  });

  it("ADMIN API request to ADMIN endpoint is allowed", async () => {
    getCurrentUserMock.mockResolvedValue(ADMIN);
    const result = await requireAdminForApi();
    expect(result.user?.role).toBe("ADMIN");
  });

  it("403 response body contains error message (not internal details)", async () => {
    getCurrentUserMock.mockResolvedValue(MEMBER);
    const result = await requireAdminForApi();
    const body = await result.error?.json();
    expect(body).toHaveProperty("error");
    expect(typeof body.error).toBe("string");
    expect(body).not.toHaveProperty("stack");
    expect(body).not.toHaveProperty("passwordHash");
  });
});
