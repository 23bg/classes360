# Auth Refactor Implementation (2026-03-29)

## Scope Delivered

This refactor moves the application toward a production-grade, password-primary auth architecture with purpose-scoped OTP and a unified token refresh flow.

Implemented in current codebase:
- Password-first signup/login under /api/v1/auth/*
- OTP usage restricted to verification, MFA, and password reset purposes
- Canonical refresh endpoint at /api/v1/auth/refresh
- Middleware refresh-before-login redirect behavior for protected routes
- Logout token-version invalidation fallback using refresh claims
- Legacy /api/auth/login and /api/auth/signup deprecation responses

## Refactored Folder Structure

Current implementation structure (Next.js route handlers + domain services):

- src/app/api/v1/auth/
- src/app/api/v1/auth/signup/route.ts
- src/app/api/v1/auth/login/route.ts
- src/app/api/v1/auth/verification/request/route.ts
- src/app/api/v1/auth/verification/route.ts
- src/app/api/v1/auth/password-reset/request/route.ts
- src/app/api/v1/auth/password-reset/route.ts
- src/app/api/v1/auth/mfa/verify/route.ts
- src/app/api/v1/auth/refresh/route.ts
- src/app/api/v1/auth/logout/route.ts
- src/app/api/v1/auth/me/route.ts
- src/modules/auth/domain/otpPurpose.ts
- src/modules/auth/domain/tokenPolicy.ts
- src/modules/auth/application/issueSession.useCase.ts
- src/modules/auth/application/refreshSession.useCase.ts
- src/modules/auth/application/logout.useCase.ts
- src/modules/auth/infrastructure/jwtAuthService.ts
- src/modules/auth/infrastructure/authUserRepository.ts
- src/features/auth/authDomainApi.ts
- src/features/auth/otpDataApi.ts

## Updated API Routes

Canonical auth API:
- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- POST /api/v1/auth/verification/request
- POST /api/v1/auth/verification
- POST /api/v1/auth/password-reset/request
- POST /api/v1/auth/password-reset
- POST /api/v1/auth/mfa/verify
- POST /api/v1/auth/refresh
- GET /api/v1/auth/refresh?next=/target
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

Compatibility routes retained without OTP-login behavior:
- POST /api/v1/auth/request-otp (purpose-scoped)
- POST /api/v1/auth/verify-otp (purpose-scoped, no session issuance)

Legacy route deprecations:
- POST /api/auth/login -> 410 (use /api/v1/auth/login)
- POST /api/auth/signup -> 410 (use /api/v1/auth/signup)

## OTP Service Design (Strict)

OtpPurpose enum:
- VERIFY_EMAIL
- MFA
- RESET_PASSWORD

Security controls in implementation:
- OTP is hashed before storage
- OTP hash is purpose-bound via hash input (purpose + otp + secret)
- OTP is time-limited using otpExpiresAt
- OTP is single-use via consumeOtp clearing fields
- OTP verification attempts are capped and invalidated after max attempts
- OTP resend limits and per-purpose+ip rate limits are enforced

## Token and Session Strategy

- Access token: JWT, short TTL (from AUTH_TTL.accessSeconds)
- Refresh token: httpOnly cookie, long TTL (from AUTH_TTL.refreshSeconds)
- Refresh rotates both access and refresh tokens on each refresh
- Token versioning in DB used for refresh revocation and logout invalidation

## Middleware / Guard Logic

Protected route middleware now:
- Checks access_token first
- If missing/invalid and refresh_token exists -> redirects to /api/v1/auth/refresh?next=...
- Redirects to /login only when refresh cannot recover session
- Keeps onboarding gating logic after session validation

SSR root behavior update:
- Root page checks refresh cookie and routes through refresh endpoint before treating user as guest

## Frontend Updates

Refactored auth UX contract:
- Signup form: email + password only
- Login form: email + password only
- Verification form: email verification and MFA contexts
- useAuth hook now calls:
- POST /api/v1/auth/signup
- POST /api/v1/auth/login
- POST /api/v1/auth/verification
- POST /api/v1/auth/logout

Constants standardized for auth paths under /auth/* with canonical refresh path /auth/refresh.

## NestJS Module Mapping (Target Architecture)

If split to NestJS backend, map current responsibilities as:

- AuthModule
- signup, login, refresh, logout endpoints
- login orchestration and session issuance

- OtpModule
- sendOtp, verifyOtp for VERIFY_EMAIL/MFA/RESET_PASSWORD
- OTP hashing, expiry, attempts, and replay prevention

- UserModule
- onboarding and profile operations
- post-login user enrichment

- SessionModule (or TokenModule)
- issue access/refresh tokens
- validate tokens
- rotate refresh tokens
- token version invalidation

Recommended NestJS structure:
- apps/api/src/modules/auth/
- auth.controller.ts
- auth.service.ts
- auth.module.ts
- apps/api/src/modules/otp/
- otp.controller.ts
- otp.service.ts
- otp.repository.ts
- otp.module.ts
- apps/api/src/modules/session/
- session.service.ts
- token.service.ts
- session.module.ts
- apps/api/src/modules/user/
- user.controller.ts
- user.service.ts
- user.module.ts

## Migration Plan From Current State

1. Freeze legacy OTP-login UI paths and direct all auth actions to canonical endpoints.
2. Roll out signup/login password flow in UI and keep verification route for email verification only.
3. Enforce emailVerified check at login (already implemented).
4. Roll out password reset pages using new endpoints.
5. Gate MFA via user-level toggle in DB; currently flow supports MFA endpoint and OTP purpose handling.
6. Add integration tests:
- signup -> verification -> login
- unverified login rejection
- refresh on 401 retry (CSR)
- middleware refresh-before-login (SSR navigation)
- logout with expired access token still revokes via refresh claim
7. Remove compatibility request-otp/verify-otp endpoints after all clients migrate.
8. Remove legacy session_token usage after billing/onboarding token update paths are migrated to a direct re-issue flow.

## Remaining Follow-ups

- Add dedicated DB fields/table for OTP purpose metadata if you want strict persistence-level purpose auditing (currently enforced via purpose-bound hashing and subject marker).
- Add first-class mfaEnabled flag to Prisma schema + migration and UI toggle.
- Consolidate duplicate API clients (src/lib/api/client.ts and src/lib/axios.ts) into one canonical client.
- Add e2e coverage for all auth critical paths.
