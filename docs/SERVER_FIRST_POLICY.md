# Server-First Policy (App Router)

## Core Principle

Server owns data. Client owns interaction.

## Mandatory Rules

1. Default every route and component to Server Component.
2. Page-level data must be fetched in server files (`page.tsx`, `layout.tsx`, server utilities).
3. Do not use Redux for server data, API response caching, or initial data loads.
4. Do not use `useEffect` for initial page data fetching.
5. Prefer Server Actions for internal app mutations.
6. Use `/app/api` only for external clients, webhooks, or integration endpoints.
7. Scope providers (`ReduxProvider`, query providers) to the smallest client subtree.
8. Any new `"use client"` usage must include explicit justification in PR description.

## Allowed Redux Use Cases

- UI-only state: modal open/close, wizard step, temporary filter panel state.
- Rare cross-page ephemeral state where URL or server state is not appropriate.

## Forbidden Redux Use Cases

- Backend data collections (students, leads, courses, billing data).
- API request lifecycle state for initial page render.
- Replacing server cache or query cache semantics.

## TanStack Query Decision Matrix

Use TanStack Query only when at least one applies:

- client-driven refetching or polling,
- optimistic updates,
- infinite scrolling / cursor pagination,
- cache synchronization across interactive widgets.

If none apply, do not use it.

## Caching Policy

| Data Class | Fetch Location | Cache Strategy | Notes |
|---|---|---|---|
| Marketing/static content | Server Component | `revalidate: 3600` or longer | ISR for SEO content |
| Tenant public pages | Server Component | `revalidate: 300-3600` | Depends on update frequency |
| Auth/session-aware dashboard shell | Server Component | `no-store` | User-specific and sensitive |
| Interactive live widget data | Client enhancement | selective TanStack Query | Only when criteria are met |
| Mutation responses | Server Action | `revalidatePath` / `revalidateTag` | Keep server source of truth |

## Approved Data Flow

- Read: server component -> service/repository -> DB/API -> render props.
- Mutate: client event -> server action -> DB/API -> revalidate -> server render.

## Migration Checklist For PRs

- [ ] Removed client initial fetch (`useEffect`/thunk) for page data.
- [ ] Moved initial data load to server component.
- [ ] Removed Redux storage for server responses.
- [ ] Reduced provider scope if touched.
- [ ] Added/updated cache strategy (`revalidate` or `no-store`).
- [ ] Added regression test for moved behavior.

## Enforcement Gate (Code Review)

Reject PRs that:

- add global providers in app root without strong architectural reason,
- add new server-data Redux slices,
- add `useEffect` initial fetch in route-level UI,
- introduce client -> axios -> internal api -> db path where Server Actions are viable.
