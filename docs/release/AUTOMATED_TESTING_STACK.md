# Classes360 Automated Testing Stack (Recommended)

## 1) Package selection (appropriate for this codebase)

### Unit + service tests
- `vitest`
- `@vitest/coverage-v8`
- `ts-node`
- `vite-tsconfig-paths`

Why:
- Fast TS-native test runner
- Good for service/repository logic (`features/*/services`)
- Works well with modern Next.js + TypeScript projects

### API route tests
- `vitest` + `supertest`
- `@types/supertest`

Why:
- Validate request/response contracts for `src/app/api/v1/**`

### UI component tests
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `jsdom`

Why:
- Validate interactive UI behavior (billing page, pricing page, forms)

### E2E tests
- `@playwright/test`

Why:
- Full flow coverage for auth, onboarding, billing, lead capture, permissions
- Multi-browser CI support

### API/network mocks
- `msw`

Why:
- Deterministic tests for UI/API without flaky external dependencies

### Optional quality gates
- `eslint-plugin-vitest`

---

## 2) Install commands (pnpm)

```bash
pnpm add -D vitest @vitest/coverage-v8 ts-node vite-tsconfig-paths
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
pnpm add -D supertest @types/supertest
pnpm add -D @playwright/test
pnpm add -D msw eslint-plugin-vitest
```

---

## 3) Suggested test scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

---

## 4) Folder structure

```text
src/
  __tests__/
    unit/
    integration/
    api/
    ui/
tests/
  e2e/
  fixtures/
  utils/
```

---

## 5) Coverage targets (release gate)

- Services + business logic: **>= 90%** statements/branches
- API routes: **>= 85%**
- Critical flows (billing/auth/lead/team limits): **100% case coverage for P0**
- E2E: all P0 cases must pass in CI

---

## 6) CI order

1. `pnpm lint`
2. `pnpm test:coverage`
3. `pnpm build`
4. `pnpm test:e2e` (staging URL)

Fail pipeline on:
- Any P0 tagged test failure
- Coverage below threshold
- Build failure
