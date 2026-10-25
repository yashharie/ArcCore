# Authentication & User Management — Member 1 Module

> **Branch**: `feature/authentication`
> **Member**: Member 1
> **Status**: ✅ Complete — all 12 tasks implemented, tested, and pushed

---

## What Was Built

A complete, production-ready authentication and user management system for ArcCore, implemented from scratch using modern Next.js 16 App Router conventions and security best practices.

---

## Implemented Features

| Task | Feature | Status |
|------|---------|--------|
| 1 | Prisma database connectivity verified | ✅ |
| 2 | Auth dependencies + architecture (`jose`, `argon2`, `zod`, `server-only`) | ✅ |
| 3 | Secure member registration (Argon2id, Zod, MEMBER-only role) | ✅ |
| 4 | Secure user login (constant-time verify, generic errors) | ✅ |
| 5 | User logout + JWT session management | ✅ |
| 6 | Login and registration pages (UI with `useActionState`) | ✅ |
| 7 | Protected routes via `proxy.ts`, `requireAuth`, dashboard page | ✅ |
| 8 | Admin and member role enforcement (`requireAdmin`, 401/403 API routes) | ✅ |
| 9 | User profile management (GET/PATCH API, profile page, update action) | ✅ |
| 10 | Authentication security test suite (22 security tests) | ✅ |
| 11 | Integration tests covering all auth flows | ✅ |
| 12 | Final review, documentation, PR readiness | ✅ |

---

## File Structure

```
src/
├── proxy.ts                          # Route protection (Next.js 16 proxy)
├── middleware.ts                     # (deleted — replaced by proxy.ts)
│
├── lib/
│   ├── prisma.ts                     # Reusable Prisma client (pre-existing)
│   ├── auth/
│   │   ├── ARCHITECTURE.ts           # Full auth design documentation
│   │   ├── password.ts               # Argon2id hash/verify (server-only)
│   │   ├── session.ts                # JWT create/read/refresh/delete (server-only)
│   │   ├── getCurrentUser.ts         # Fetch current user from session (server-only)
│   │   └── authorization.ts          # requireAuth, requireAdmin, API variants
│   └── validation/
│       └── auth.ts                   # Zod schemas: Register, Login, UpdateProfile
│
├── app/
│   ├── actions/
│   │   ├── auth.ts                   # Server Actions: register, login, logout
│   │   └── profile.ts                # Server Action: updateProfile
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.tsx              # Login page (Server Component + metadata)
│   │   │   └── LoginForm.tsx         # Login form (Client Component)
│   │   └── register/
│   │       ├── page.tsx              # Register page (Server Component + metadata)
│   │       └── RegisterForm.tsx      # Register form (Client Component)
│   │
│   ├── dashboard/
│   │   └── page.tsx                  # Protected dashboard (requireAuth + logout)
│   │
│   ├── profile/
│   │   ├── page.tsx                  # Protected profile page
│   │   └── ProfileForm.tsx           # Profile update form
│   │
│   └── api/
│       ├── admin/users/route.ts      # GET /api/admin/users (ADMIN only)
│       └── user/profile/route.ts     # GET+PATCH /api/user/profile
│
└── __tests__/
    ├── __mocks__/
    │   └── server-only.ts            # Vitest mock for server-only package
    └── auth/
        ├── registration.test.ts      # RegisterSchema + Argon2id (12 tests)
        ├── login.test.ts             # LoginSchema + password verify (9 tests)
        ├── session.test.ts           # JWT round-trip, tamper, expiry (6 tests)
        ├── authorization.test.ts     # requireAuth/Admin page + API guards (10 tests)
        ├── authorization-roles.test.ts # Role escalation prevention (8 tests)
        ├── profile.test.ts           # UpdateProfileSchema security (8 tests)
        └── security.test.ts          # Full security suite (22 tests)
```

---

## Security Guarantees

- **Passwords**: Argon2id (64 MiB, 3 iterations, parallelism 4) — OWASP recommended. Never stored or logged in plaintext. Never returned in API responses.
- **Sessions**: Stateless JWT (HS256), signed with `SESSION_SECRET`, 7-day expiry. Stored in `HttpOnly; Secure; SameSite=lax` cookie — inaccessible to JavaScript.
- **Role assignment**: `MEMBER` is hardcoded server-side for all public registrations. `ADMIN` cannot be self-assigned under any circumstance.
- **Account enumeration**: Login returns "Invalid email or password" for both missing accounts and wrong passwords. Dummy hash computation runs even on missing accounts to prevent timing attacks.
- **Input validation**: All input validated server-side with Zod before any DB interaction. Schema strips unknown fields — `role`, `email`, `passwordHash` cannot be injected via request body.
- **Authorization**: Every protected handler verifies authentication and role from a fresh DB lookup via `getCurrentUser()` — never trusts client-supplied role claims.
- **Admin endpoints**: Return `401` for unauthenticated and `403` for authenticated non-admins. Error responses contain no internal details, no stack traces.

---

## Environment Variables Required

Copy `.env.example` to `.env` and fill in:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/arccore"
SESSION_SECRET="<32+ byte random string>"
```

Generate `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

---

## Test Results

```
Test Files  7 passed (7)
     Tests  75 passed (75)
  Duration  ~3s
```

---

## Routes Added

| Route | Type | Access |
|-------|------|--------|
| `/login` | Static | Public (redirects authenticated users) |
| `/register` | Static | Public (redirects authenticated users) |
| `/dashboard` | Dynamic | Authenticated only |
| `/profile` | Dynamic | Authenticated only |
| `/api/user/profile` | Dynamic | Authenticated only |
| `/api/admin/users` | Dynamic | ADMIN only |

---

## How Other Members Use This

```typescript
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { requireAuth, requireAdmin } from "@/lib/auth/authorization";
import { requireAuthForApi, requireAdminForApi } from "@/lib/auth/authorization";

// In a Server Component / Server Action:
const user = await requireAuth();   // redirects to /login if not authenticated
const admin = await requireAdmin(); // redirects to /dashboard if not ADMIN

// In a Route Handler:
const { user, error } = await requireAuthForApi();
if (error) return error; // 401 response

const { user, error } = await requireAdminForApi();
if (error) return error; // 401 or 403 response
```
