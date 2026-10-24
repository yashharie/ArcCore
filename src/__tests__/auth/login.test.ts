/**
 * Tests for login validation and authentication logic.
 *
 * Tests the LoginSchema validation and verifies the password hashing
 * interaction. The login Server Action itself uses Next.js-specific APIs
 * (redirect, cookies) that require a request context; those paths are
 * covered in the integration/security suite (Task 10).
 */

import { describe, it, expect } from "vitest";
import { LoginSchema } from "@/lib/validation/auth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

// ---------------------------------------------------------------------------
// LoginSchema validation
// ---------------------------------------------------------------------------

describe("LoginSchema", () => {
  it("accepts valid credentials", () => {
    const result = LoginSchema.safeParse({
      email: "alice@example.com",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes email to lowercase and trims whitespace", () => {
    const result = LoginSchema.safeParse({
      email: "  ALICE@EXAMPLE.COM  ",
      password: "anypassword",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("alice@example.com");
    }
  });

  it("rejects an invalid email format", () => {
    const result = LoginSchema.safeParse({
      email: "not-an-email",
      password: "anypassword",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = LoginSchema.safeParse({
      email: "alice@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    const result = LoginSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Password verification (the key security property of login)
// ---------------------------------------------------------------------------

describe("login password verification", () => {
  it("accepts the correct password", async () => {
    const password = "CorrectPass1";
    const hash = await hashPassword(password);
    expect(await verifyPassword(hash, password)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("CorrectPass1");
    expect(await verifyPassword(hash, "WrongPass1")).toBe(false);
  });

  it("rejects an empty string against a real hash", async () => {
    const hash = await hashPassword("CorrectPass1");
    expect(await verifyPassword(hash, "")).toBe(false);
  });

  it("rejects a password that differs only by case", async () => {
    const hash = await hashPassword("correctpass1");
    expect(await verifyPassword(hash, "CORRECTPASS1")).toBe(false);
  });
});
