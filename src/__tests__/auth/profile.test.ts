/**
 * Tests for user profile management.
 *
 * Tests the UpdateProfileSchema validation and verifies that disallowed
 * fields (role, email, passwordHash) cannot be updated through the schema.
 */

import { describe, it, expect } from "vitest";
import { UpdateProfileSchema } from "@/lib/validation/auth";

describe("UpdateProfileSchema", () => {
  it("accepts a valid name update", () => {
    const result = UpdateProfileSchema.safeParse({ name: "Alice Updated" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Alice Updated");
    }
  });

  it("accepts an empty object (no-op update)", () => {
    const result = UpdateProfileSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBeUndefined();
    }
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = UpdateProfileSchema.safeParse({ name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects a name longer than 100 characters", () => {
    const result = UpdateProfileSchema.safeParse({ name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("does NOT allow updating email through the schema", () => {
    const result = UpdateProfileSchema.safeParse({
      name: "Alice",
      email: "hacker@example.com", // should be stripped
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("email");
    }
  });

  it("does NOT allow updating role through the schema", () => {
    const result = UpdateProfileSchema.safeParse({
      name: "Alice",
      role: "ADMIN", // should be stripped
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("role");
    }
  });

  it("does NOT allow updating passwordHash through the schema", () => {
    const result = UpdateProfileSchema.safeParse({
      name: "Alice",
      passwordHash: "$argon2id$...", // should be stripped
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("passwordHash");
    }
  });

  it("trims whitespace from the name", () => {
    const result = UpdateProfileSchema.safeParse({ name: "  Alice  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Alice");
    }
  });
});
