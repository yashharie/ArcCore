/**
 * Tests for member registration logic.
 *
 * Tests the Zod validation schema and password hashing directly —
 * these are pure functions that don't need mocking.
 *
 * The Server Action itself uses `redirect()` and `cookies()` from Next.js
 * which require a request context. Those are covered by integration tests
 * in the auth security suite (Task 10).
 */

import { describe, it, expect } from "vitest";
import { RegisterSchema } from "@/lib/validation/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------

describe("RegisterSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice Smith",
      email: "alice@example.com",
      password: "SecurePass1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      // email must be normalized to lowercase
      expect(result.data.email).toBe("alice@example.com");
    }
  });

  it("normalizes email to lowercase", () => {
    const result = RegisterSchema.safeParse({
      name: "Bob",
      email: "  BOB@EXAMPLE.COM  ",
      password: "SecurePass1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("bob@example.com");
    }
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = RegisterSchema.safeParse({
      name: "A",
      email: "alice@example.com",
      password: "SecurePass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects an invalid email address", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice",
      email: "not-an-email",
      password: "SecurePass1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "Ab1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.password).toBeDefined();
    }
  });

  it("rejects a password with no letters", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password with no numbers", () => {
    const result = RegisterSchema.safeParse({
      name: "Alice",
      email: "alice@example.com",
      password: "OnlyLetters",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = RegisterSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toBeDefined();
      expect(errors.email).toBeDefined();
      expect(errors.password).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// Password hashing
// ---------------------------------------------------------------------------

describe("password hashing (Argon2id)", () => {
  it("produces a hash that differs from the plaintext", async () => {
    const hash = await hashPassword("SecurePass1");
    expect(hash).not.toBe("SecurePass1");
    expect(hash.length).toBeGreaterThan(20);
  });

  it("verifies a correct password against its hash", async () => {
    const password = "SecurePass1";
    const hash = await hashPassword(password);
    const valid = await verifyPassword(hash, password);
    expect(valid).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("SecurePass1");
    const valid = await verifyPassword(hash, "WrongPassword1");
    expect(valid).toBe(false);
  });

  it("produces different hashes for the same password (random salt)", async () => {
    const password = "SecurePass1";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
    // But both must verify correctly
    expect(await verifyPassword(hash1, password)).toBe(true);
    expect(await verifyPassword(hash2, password)).toBe(true);
  });
});
