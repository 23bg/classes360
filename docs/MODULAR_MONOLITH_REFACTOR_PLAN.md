# Modular Monolith Refactor Plan

## Target Structure

```text
src/
  modules/
    auth/
      domain/
      application/
      infrastructure/
      api/
    student/
    billing/
    dashboard/
  shared/
    db/
    auth/
    utils/
    types/
  app/
    api/
      v1/
```

## Old -> New Mapping

- `src/lib/auth/*` -> `src/modules/auth/infrastructure/*` + `src/modules/auth/domain/*`
- `src/app/api/v1/auth/*` -> thin controllers + `src/modules/auth/application/*`
- `src/features/auth/authDomainApi.ts` -> split into use cases under `src/modules/auth/application/*`
- `src/server/studentsApi.ts` -> `src/modules/student/application/*` and `src/modules/student/infrastructure/*`
- `src/features/billing/*` -> `src/modules/billing/*`
- `src/features/dashboard/*` service logic -> `src/modules/dashboard/application/*`
- shared helpers (`logger`, `errors`, `tenant-scope`) -> `src/shared/*`

## Auth Module Refactor (Implemented)

Created:
- `src/modules/auth/domain/types.ts`
- `src/modules/auth/domain/tokenPolicy.ts`
- `src/modules/auth/infrastructure/jwtAuthService.ts`
- `src/modules/auth/infrastructure/authUserRepository.ts`
- `src/modules/auth/application/issueSession.useCase.ts`
- `src/modules/auth/application/refreshSession.useCase.ts`
- `src/modules/auth/application/getSession.useCase.ts`
- `src/modules/auth/application/logout.useCase.ts`
- `src/modules/auth/api/schemas.ts`
- `src/modules/auth/api/responses.ts`
- `src/modules/auth/api/refreshToken.controller.ts`

Rewired routes:
- `src/app/api/v1/auth/verify-otp/route.ts`
- `src/app/api/v1/auth/request-otp/route.ts`
- `src/app/api/v1/auth/me/route.ts`
- `src/app/api/v1/auth/logout/route.ts`
- `src/app/api/v1/auth/refresh-token/route.ts`
- `src/app/api/v1/auth/refresh/route.ts`

Compatibility bridge kept:
- `src/lib/auth/auth.ts`
- `src/lib/auth/tokens.ts`

## Auth Token Flow

1. Verify OTP route validates payload.
2. Application service verifies OTP/user.
3. `issueSessionUseCase` builds access + refresh tokens.
4. Tokens are written to `access_token` and `refresh_token`.
5. Legacy `session_token` is still written during migration for compatibility.
6. Refresh route verifies refresh token + tokenVersion and rotates both tokens.
7. Logout clears tokens and increments tokenVersion to revoke outstanding refresh tokens.

## Middleware Strategy

- Middleware should validate only `access_token`.
- Routes should rely on `getSessionUseCase` and role checks.
- During migration, `session_token` fallback remains available in compatibility helpers.

## State Management Cleanup Strategy

- TanStack Query: all server data fetching/mutation.
- Redux: UI/session view state only.
- Remove API calls from Redux slices incrementally by domain:
  1. dashboard
  2. students
  3. courses/batches
- Keep one HTTP client with one refresh policy.

## Migration Order (Low-Risk)

1. Add module folders and compatibility wrappers (done for auth).
2. Move auth route logic into module use cases (done).
3. Introduce tokenVersion in schema (done, requires DB migration rollout).
4. Cut over student module (next): split `server/studentsApi.ts` into domain/application/infrastructure.
5. Cut over billing and dashboard modules.
6. Replace Redux server-state slices with TanStack Query feature by feature.
7. Remove legacy compatibility paths (`session_token`, duplicate auth helpers) after metrics and logs confirm no usage.

## What Not To Touch First

- Public SEO pages and static content routes.
- Tenant/domain routing resolution logic.
- Billing calculations while auth/session migration is in progress.

## Safe Rollout Controls

- Add per-route error-rate dashboards before and after cutover.
- Roll out auth module behind an env flag if needed.
- Keep old cookie fallback for one release window.
- Add contract tests for auth routes and session refresh behavior.
