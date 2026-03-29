# Performance Guardrails

These guardrails preserve performance while the product grows.

## Rendering Strategy

- Default to Server Components.
- Add `"use client"` only when local state, effects, browser APIs, or direct event handlers are required.
- Keep client components focused on interaction islands (forms, filters, modals, DnD, charts).

## Data Fetching

- Prefer server-side data fetching for dashboard page bootstrapping.
- Avoid parallel client boot calls for related dashboard data when a consolidated API can be used.
- Avoid duplicate fetches of the same data in nested components.

## Scripts and Third-Party SDKs

- Do not load third-party scripts globally in root layout unless required by all surfaces.
- Load gateway SDKs only on relevant routes using Next `Script` with explicit strategy.

## Bundle Size

- Run `pnpm analyze` before major releases.
- Prefer `next/dynamic` for heavy widgets and tour systems.
- Review large dependencies before introducing new ones.

## Multi-Tenant Safety

- Every tenant-aware query must include `instituteId` scoping.
- Prefer shared helper utilities for tenant where clauses.
- Add tests for host routing and tenant path rewrites.

## Public Surface Caching

- Keep ISR on tenant public routes (`revalidate` based on freshness requirements).
- Avoid unnecessary client JS on `/i/[slug]` pages.
