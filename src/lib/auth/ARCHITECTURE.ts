/**
 * Authentication Architecture Documentation
 * ==========================================
 *
 * ## Overview
 *
 * ArcCore uses a custom, stateless JWT-based authentication system built on
 * established, well-reviewed libraries. No third-party auth services are used.
 *
 * ## Technology Choices
 *
 * | Concern          | Library              | Rationale                                     |
 * |------------------|----------------------|-----------------------------------------------|
 * | Password hashing | @node-rs/argon2      | Argon2id — OWASP recommended, native binaries |
 * | Session tokens   | jose                 | JWT sign/verify, recommended by Next.js docs  |
 * | Input validation | zod                  | Type-safe schema validation                   |
 * | Server guard     | server-only          | Prevents auth code from reaching client       |
 *
 * ## Authentication Flow
 *
 * ### Registration
 * 1. Client submits name, email, password via Server Action.
 * 2. Server validates all fields with Zod (server-side).
 * 3. Email is normalized to lowercase and trimmed.
 * 4. Role is hardcoded to MEMBER — never accepted from client input.
 * 5. Password is hashed with Argon2id (never stored plaintext).
 * 6. User record is created in PostgreSQL via Prisma.
 * 7. Session JWT is created and stored in an HttpOnly cookie.
 * 8. Client is redirected to the dashboard.
 *
 * ### Login
 * 1. Client submits email and password via Server Action.
 * 2. Server validates fields with Zod.
 * 3. User is looked up by email (normalized).
 * 4. Password is verified with Argon2id `verify()`.
 * 5. On success, a new session JWT is issued.
 * 6. On failure, a generic "Invalid credentials" message is returned
 *    (does not reveal whether the account exists).
 *
 * ### Session Validation
 * 1. Server reads the `arccore_session` HttpOnly cookie.
 * 2. JWT is verified with HS256 using SESSION_SECRET.
 * 3. Expiry is checked by jose automatically.
 * 4. Session payload ({ userId, role }) is returned to the caller.
 * 5. Caller uses userId to fetch fresh user data from DB if needed.
 *
 * ### Logout
 * 1. Server Action deletes the `arccore_session` cookie.
 * 2. Client is redirected to the login page.
 *
 * ## Session Design
 *
 * - **Type**: Stateless JWT (no server-side session store needed).
 * - **Algorithm**: HS256 (HMAC-SHA256).
 * - **Expiry**: 7 days; sliding window refresh on each authenticated request.
 * - **Cookie name**: `arccore_session`
 * - **Cookie flags**: HttpOnly, Secure (production), SameSite=lax, Path=/
 * - **Payload**: { userId: string, role: "ADMIN" | "MEMBER", expiresAt: ISO date }
 *   — minimum data, no passwords, no PII.
 *
 * ## Security Properties
 *
 * - Passwords are never stored, logged, or returned through any API.
 * - Password hashes are never returned through any API response.
 * - Session cookies are HttpOnly — inaccessible to JavaScript.
 * - Session tokens are signed — tampering is detected by jose.
 * - Role in session token is server-verified — not trusted from client.
 * - Authorization is enforced server-side in every handler and Server Action.
 * - Generic error messages prevent account enumeration.
 * - Public registration always assigns the MEMBER role.
 * - ADMIN role can only be granted through a trusted server-side process.
 *
 * ## Required Environment Variables
 *
 * See .env.example for placeholder definitions.
 *
 * | Variable        | Description                            |
 * |-----------------|----------------------------------------|
 * | DATABASE_URL    | PostgreSQL connection string           |
 * | SESSION_SECRET  | 32+ byte random string for JWT signing |
 *
 * Generate SESSION_SECRET with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
 *
 * ## File Structure
 *
 * src/lib/auth/
 *   session.ts       — JWT create/verify/delete (server-only)
 *   password.ts      — Argon2id hash/verify (server-only)
 *   getCurrentUser.ts — Retrieve authenticated user from session (server-only)
 *
 * src/lib/validation/
 *   auth.ts          — Zod schemas for registration and login inputs
 *
 * src/app/actions/
 *   auth.ts          — Server Actions: register, login, logout
 *
 * ## How Other Modules Access the Current User
 *
 * Import and call `getCurrentUser()` from `@/lib/auth/getCurrentUser` in any
 * Server Component, Server Action, or Route Handler:
 *
 *   const user = await getCurrentUser()
 *   if (!user) redirect('/login')
 *
 * The function returns { id, email, name, role } or null if unauthenticated.
 * It never returns passwordHash.
 */

export {}; // This file is documentation only — no runtime exports.
