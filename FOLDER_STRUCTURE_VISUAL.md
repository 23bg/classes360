# 📂 FOLDER STRUCTURE - BEFORE & AFTER REFACTOR

## BEFORE (Current - Full of Duplication)

```
src/
├── app/
│   ├── layout.tsx                 (has ReduxProvider - WRONG!)
│   ├── page.tsx
│   ├── (public)/
│   ├── (auth)/
│   ├── (dashboard)/
│   │   └── layout.tsx             (no ReduxProvider yet)
│   └── api/
│
├── features/
│   ├── auth/
│   │   ├── services/
│   │   │   └── auth.service.ts    ❌ TO DELETE
│   │   ├── repositories/
│   │   │   ├── user.repo.ts       ❌ TO DELETE
│   │   │   └── otp.repo.ts        ❌ TO DELETE
│   │   ├── slices/
│   │   │   └── authSlice.ts       ❌ To minimize
│   │   ├── types/
│   │   │   └── auth.type.ts       ✅ Keep
│   │   ├── components/
│   │   ├── validations/
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── index.ts
│   │
│   ├── student/                   (empty - no api infrastructure)
│   │   └── index.ts
│   │
│   ├── course/
│   │   ├── services/
│   │   │   └── course.service.ts  ❌ TO DELETE
│   │   ├── repositories/
│   │   │   └── course.repo.ts     ❌ TO DELETE
│   │   └── index.ts
│   │
│   ├── teacher/
│   │   ├── services/
│   │   │   └── teacher.service.ts ❌ TO DELETE
│   │   ├── repositories/
│   │   │   └── teacher.repo.ts    ❌ TO DELETE
│   │   └── index.ts
│   │
│   ├── batch/                     (TODO)
│   ├── fee/                       (TODO)
│   ├── lead/                      (TODO)
│   ├── team/                      (TODO)
│   ├── billing/                   (TODO)
│   ├── subscription/              (TODO)
│   ├── institute/                 (TODO)
│   │   ├── services/
│   │   │   └── institute.service.ts
│   │   ├── repositories/
│   │   │   └── institute.repo.ts
│   │   └── index.ts
│   │
│   ├── whatsapp/                  (TODO)
│   │   ├── services/
│   │   │   └── whatsapp-integration.service.ts
│   │   ├── repositories/
│   │   │   ├── whatsapp-account.repo.ts
│   │   │   └── notification-preference.repo.ts
│   │   └── index.ts
│   │
│   ├── integration/               (TODO)
│   │   ├── services/
│   │   │   └── integration.service.ts
│   │   └── index.ts
│   │
│   ├── notes/                     (TODO)
│   │   ├── services/
│   │   │   └── note.service.ts
│   │   └── index.ts
│   │
│   ├── attendance/                (TODO)
│   │   ├── services/
│   │   │   └── attendance.service.ts
│   │   └── index.ts
│   │
│   ├── dashboard/                 (TODO)
│   │   ├── services/
│   │   │   └── dashboard.service.ts
│   │   ├── dashboardSlice.ts      ❌ TO DELETE (use queries)
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── app/
│   │   └── appSlice.ts            ❌ TO DELETE
│   │
│   ├── profile/                   (TODO)
│   ├── business/                  (TODO)
│   └── ui/
│       └── uiSlice.ts             ✅ Keep (UI state only)
│
├── lib/
│   ├── auth/
│   │   ├── auth.ts
│   │   ├── tokens.ts
│   │   └── student-tokens.ts
│   ├── api/
│   │   └── (empty - PROBLEM!)
│   ├── services/
│   │   ├── mailer.service.ts
│   │   ├── whatsapp.ts
│   │   └── whatsapp-alert-events.ts
│   ├── db/
│   ├── utils/
│   ├── config/
│   ├── hooks/
│   ├── utils/
│   └── store.ts                   ❌ Includes too many slices
│
├── services/                       ❌ DUPLICATION - TO DELETE
│   ├── api.ts                      ❌ Old RTK Query baseApi
│   ├── appUi.api.ts                ❌ Old RTK Query endpoints
│   ├── adminDashboard.api.ts       ❌ Old RTK Query endpoints
│   └── dashboardTables.api.ts      ❌ Old RTK Query endpoints
│
├── modules/
│   ├── student/
│   │   ├── components/
│   │   ├── screens/
│   │   └── forms/
│   ├── team/
│   ├── dashboard/
│   ├── institute/
│   ├── ai/
│   ├── marketing/
│   ├── tools/
│   └── auth/
│
├── components/
│   ├── ui/
│   ├── common/
│   ├── dashboard/
│   ├── layout/
│   ├── custom/
│   ├── forms/
│   ├── seo/
│   ├── landing/
│   ├── student/
│   └── help/
│
├── providers/
│   ├── ReduxProvider.tsx           ⚠️ In root layout (WRONG!)
│   ├── QueryProvider.tsx           ⚠️ To be created
│   ├── DashboardLayoutWithProviders.tsx  ⚠️ To be created
│   └── theme-provider.tsx
│
└── ...
```

---

## AFTER (Target - Clean Architecture)

```
src/
├── app/
│   ├── layout.tsx                 ✅ No ReduxProvider
│   │   └── Uses: QueryProvider only
│   ├── page.tsx
│   ├── (public)/                  ✅ Server-rendered
│   │   └── No Redux
│   ├── (auth)/                    ✅ Server-rendered
│   │   └── No Redux
│   ├── (dashboard)/
│   │   └── layout.tsx             ✅ Has ReduxProvider here
│   └── api/
│
├── features/                       🎯 CLEAN DATA LAYER
│   ├── auth/
│   │   ├── api.ts                 ✅ React Query hooks
│   │   ├── hooks.ts               ✅ useAuth()
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── slices/
│   │   │   └── authSlice.ts       ✅ Minimal (user + role only)
│   │   ├── validations/
│   │   ├── components/            (keep if needed)
│   │   └── index.ts
│   │
│   ├── student/                   ✅ NEW PATTERN
│   │   ├── api.ts                 ✅ useGetStudents, useCreateStudent, etc
│   │   ├── hooks.ts               ✅ useStudentFilters, useStudentSelection
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── course/                    ✅ SAME PATTERN as student
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── teacher/                   ✅ SAME PATTERN
│   │   ├── api.ts
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   └── index.ts
│   │
│   ├── batch/                     ✅ SAME PATTERN
│   ├── fee/                       ✅ SAME PATTERN
│   ├── lead/                      ✅ SAME PATTERN
│   ├── team/                      ✅ SAME PATTERN
│   ├── billing/                   ✅ SAME PATTERN
│   ├── subscription/              ✅ SAME PATTERN
│   ├── institute/                 ✅ SAME PATTERN
│   ├── whatsapp/                  ✅ SAME PATTERN
│   ├── integration/               ✅ SAME PATTERN
│   ├── notes/                     ✅ SAME PATTERN
│   ├── attendance/                ✅ SAME PATTERN
│   ├── profile/                   ✅ SAME PATTERN
│   ├── business/                  ✅ SAME PATTERN
│   │
│   ├── dashboard/                 ✅ NO MORE SLICE
│   │   └── Broken down into individual queries
│   │
│   ├── ui/                        ✅ Redux slice for UI only
│   │   └── uiSlice.ts
│   │
│   └── app/                       ✅ Deleted if unused
│
├── lib/
│   ├── api/                       🎯 NEW CENTRALIZED
│   │   ├── client.ts              ✅ Axios instance
│   │   ├── query-client.ts        ✅ React Query config
│   │   └── index.ts               ✅ Barrel export
│   ├── auth/
│   │   ├── auth.ts
│   │   ├── tokens.ts
│   │   └── student-tokens.ts
│   ├── services/                  ✅ Only server-side services
│   │   ├── mailer.service.ts
│   │   └── whatsapp.ts
│   ├── db/
│   ├── utils/
│   ├── config/
│   ├── hooks/
│   └── store.ts                   ✅ Minimal (auth + ui only)
│
├── modules/                        🎯 UI ONLY (No API calls)
│   ├── student/
│   │   ├── components/            ✅ Pure UI
│   │   ├── screens/               ✅ Orchestration (uses hooks)
│   │   └── forms/
│   ├── team/
│   ├── dashboard/
│   ├── institute/
│   ├── ai/
│   ├── marketing/
│   ├── tools/
│   └── auth/
│
├── components/                     🎯 REUSABLE UI ONLY
│   ├── ui/
│   ├── common/
│   ├── layout/
│   ├── seo/
│   ├── forms/
│   └── ...
│
├── providers/
│   ├── QueryProvider.tsx           ✅ In root layout
│   ├── DashboardLayoutWithProviders.tsx ✅ Wraps dashboard
│   ├── ReduxProvider.tsx           ✅ Used by above
│   └── theme-provider.tsx
│
└── ...
```

---

## Summary of Changes

### Files to ADD ✅
```
lib/api/
  ├── client.ts              (Axios instance)
  ├── query-client.ts        (React Query setup)
  └── index.ts

provider/
  ├── QueryProvider.tsx      (React Query wrapper)
  └── DashboardLayoutWithProviders.tsx

features/*/
  ├── api.ts                 (React Query hooks)
  ├── hooks.ts               (Custom hooks)
  ├── types.ts               (Type definitions)
  └── index.ts               (Barrel export)

features/ui/
  └── uiSlice.ts             (UI state Redux)
```

### Files to DELETE ❌
```
features/*/services/         (All service folders)
features/*/repositories/     (All repository folders)
features/*/[feature]Slice.ts (Redux slices for API data)

src/services/
  ├── api.ts
  ├── appUi.api.ts
  ├── adminDashboard.api.ts
  └── dashboardTables.api.ts

features/dashboard/dashboardSlice.ts
features/app/appSlice.ts (if unused)
```

### Files to UPDATE ✅
```
app/layout.tsx               (Add QueryProvider, remove ReduxProvider)
app/(dashboard)/layout.tsx   (Add DashboardLayoutWithProviders)
lib/store.ts                 (Remove extra slices, keep auth + ui)
features/auth/slices/authSlice.ts (Remove thunks, minimize)
```

---

## Pattern Clarity: What Goes Where

### 🎯 features/[feature]/ (DATA LAYER)
**Responsibility**: All API communication
- `api.ts` → React Query hooks for data fetching
- `hooks.ts` → Custom logic (filters, pagination, selection)
- `types.ts` → TypeScript interfaces
- Previously: services + repositories (NOW: DELETED)

### 🎨 modules/[feature]/ (UI LAYER)  
**Responsibility**: UI rendering and orchestration
- `components/` → Pure UI components (no API calls)
- `screens/` → Page-level components using feature hooks
- `forms/` → Form definition (validation, submission)
- **IMPORTANT**: These import from `features/` for data

### 🔧 components/ (SHARED UI)
**Responsibility**: Reusable UI pieces
- `ui/` → Button, Input, Modal, etc
- `common/` → Navigation, Sidebar, etc
- `layout/` → Layout components
- **IMPORTANT**: Zero API calls, zero business logic

### 💾 lib/ (UTILITIES & CONFIG)
**Responsibility**: Shared utilities
- `api/` → HTTP client + React Query setup
- `auth/` → Token helpers, auth utilities
- `hooks/` → Global hooks (useAuth, useSession)
- `utils/` → General utilities
- `services/` → Server-side services only

### 📦 lib/store.ts (STATE MANAGEMENT)
**Responsibility**: MINIMAL Redux
- `auth` slice → Current user, role (from React Query after login)
- `ui` slice → Sidebar open/closed, modal state, toast messages
- **IMPORTANT**: NO API data in Redux

---

## Clear Responsibility Lines

```
Request Data
    ↓
Feature API Hook (features/student/api.ts)
    ↓
React Query (useQuery)
    ↓
HTTP Client (lib/api/client.ts)
    ↓
API Route (/api/v1/students)
    ↓
Database

Display Data
    ↓
Module Screen (modules/student/screens/)
    ↓
Uses Feature Hook (useGetStudents)
    ↓
Module Component (modules/student/components/)
    ↓
Reusable UI (components/ui/)

Manage UI State
    ↓
Redux UI Slice (features/ui/uiSlice.ts)
    ↓
Use in Components (toggleSidebar, etc)
```

---

## One-Line Summary

**BEFORE**: API → Service → Repository → Redux → Component (4 layers, messy)  
**AFTER**: API → React Query Hook → Component (1 layer, clean)

---

## Folder Structure Command (Verify)

To see actual current structure:
```bash
# After refactor should show:
tree src/features/student
tree src/features/auth

# And should show NOTHING like:
tree src/services          # Should be ~empty or deleted
tree src/features/course/services  # Should NOT exist
```

---

**The end result?** 

A codebase where every feature follows the same pattern, making it dead simple to add new features or maintain existing ones. ✨

