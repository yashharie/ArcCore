/**
 * Password hashing utilities — server-only.
 *
 * Uses Argon2id (via @node-rs/argon2) which is the OWASP recommended
 * algorithm for password hashing. Parameters follow OWASP recommendations:
 *   - memoryCost: 64 MiB (65536 KiB)
 *   - timeCost:   3 iterations
 *   - parallelism: 4
 *
 * Argon2id provides resistance against both side-channel and GPU attacks.
 *
 * Note: Algorithm.Argon2id is a const enum (value 2). We use the literal to
 * avoid isolatedModules incompatibility while keeping the intent explicit.
 */

import "server-only";
import { hash, verify } from "@node-rs/argon2";

// Algorithm.Argon2id = 2 (const enum — inlined to satisfy isolatedModules)
const ARGON2_OPTIONS = {
  algorithm: 2 as const, // 2 = Argon2id
  memoryCost: 65536, // 64 MiB in KiB
  timeCost: 3,
  parallelism: 4,
} as const;

/**
 * Hash a plaintext password using Argon2id.
 * Never log or return the result through API responses.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2_OPTIONS);
}

/**
 * Verify a plaintext password against a stored Argon2id hash.
 * Returns true if the password matches, false otherwise.
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return verify(hash, password, ARGON2_OPTIONS);
}
