# 📋 ARCHITECTURE REFACTOR v2 - COMPLETE CHECKLIST

## Overview
Status: **Phase 0-1 Complete (10% Overall)**

```
[████████████░░░░░░░░░░░░░░░░░░░░░░░░] 10%
```

---

## ⏸️ Current State (What's Done)

### ✅ Infrastructure Layer
- [x] React Query client setup (`lib/api/client.ts`)
- [x] React Query configuration (`lib/api/query-client.ts`)
- [x] QueryProvider added to root layout
- [x] Redux simplified (auth + ui only)
- [x] ReduxProvider moved to dashboard layout only
- [x] DashboardLayoutWithProviders wrapper created

### ✅ Core Feature Examples
- [x] Auth feature refactored (types, api.ts, hooks.ts, simplified slice)
- [x] Student feature created (types, api.ts with queries/mutations, hooks, index)
- [x] UI Redux slice created (`features/ui/uiSlice.ts`)
- [x] All documentation written (Architecture Plan, Detailed Guide, Execution Guide)

### ❌ Yet to Do
- [ ] Migrate remaining 13 features
- [ ] Delete old services/repositories
- [ ] Delete old RTK Query files
- [ ] Update all components
- [ ] Full validation and testing

---

## 🚀 Phase 1: Core Features Refactoring

### Auth Feature
Status: **80% - Cleanup Needed**
```
[████████████████░░░░░░] 80%
```
- [x] Create `features/auth/types/index.ts`
- [x] Create `features/auth/api.ts` (React Query hooks)
- [x] Create `features/auth/hooks.ts` (useAuth custom hook)
- [x] Simplify `features/auth/slices/authSlice.ts`
- [x] Create `features/auth/index.ts` barrel export
- [ ] **CLEANUP**: Delete old files
  - [ ] `features/auth/services/` folder
  - [ ] `features/auth/repositories/` folder

**Next**: Delete old files and test

---

### Student Feature
Status: **50% - Component Update Needed**
```
[██████████░░░░░░░░░░░░░░] 50%
```
- [x] Create `features/student/types.ts`
- [x] Create `features/student/api.ts` (useGetStudents, useCreateStudent, etc)
- [x] Create `features/student/hooks.ts` (useStudentFilters, useStudentSelection, etc)
- [x] Update `features/student/index.ts` barrel export
- [ ] Find all components using student data
- [ ] Update components to use React Query hooks instead of Redux
- [ ] Test all student functionality
- [ ] **CLEANUP**: Delete old files
  - [ ] `features/student/services/` (if exists)
  - [ ] `features/student/repositories/` (if exists)

**Next**: Audit and update components

---

## 🟢 Phase 2: Priority 1 Features (HIGH IMPACT)

### Course Feature
Status: **0% - Not Started**
- [ ] Create `features/course/types.ts`
- [ ] Create `features/course/api.ts` (useGetCourses, etc)
- [ ] Create `features/course/hooks.ts`
- [ ] Update `features/course/index.ts`
- [ ] Update all components using courses
- [ ] Delete old files

---

### Teacher Feature
Status: **0% - Not Started**
- [ ] Create `features/teacher/types.ts`
- [ ] Create `features/teacher/api.ts`
- [ ] Create `features/teacher/hooks.ts`
- [ ] Update `features/teacher/index.ts`
- [ ] Update all components
- [ ] Delete old files

---

### Batch Feature
Status: **0% - Not Started**
- [ ] Create `features/batch/types.ts`
- [ ] Create `features/batch/api.ts`
- [ ] Create `features/batch/hooks.ts`
- [ ] Update `features/batch/index.ts`
- [ ] Update all components
- [ ] Delete old files

---

### Fee Feature
Status: **0% - Not Started**
- [ ] Create `features/fee/types.ts`
- [ ] Create `features/fee/api.ts`
- [ ] Create `features/fee/hooks.ts`
- [ ] Update `features/fee/index.ts`
- [ ] Update all components
- [ ] Delete old files

---

### Lead Feature
Status: **0% - Not Started**
- [ ] Create `features/lead/types.ts`
- [ ] Create `features/lead/api.ts`
- [ ] Create `features/lead/hooks.ts`
- [ ] Update `features/lead/index.ts`
- [ ] Update all components
- [ ] Delete old files

---

## 🟡 Phase 3: Priority 2 Features (SECONDARY)

- [ ] Team feature (5 items)
- [ ] Billing feature (5 items)
- [ ] Subscription feature (5 items)
- [ ] Institute feature (5 items)
- [ ] Attendance feature (5 items)

---

## 🔵 Phase 4: Priority 3 Features (INTEGRATION)

- [ ] WhatsApp feature (3 items)
- [ ] Integration feature (3 items)
- [ ] Notes feature (3 items)
- [ ] Dashboard feature - complex aggregations (special handling)

---

## 🟣 Phase 5: Priority 4 Features (CLEANUP)

- [ ] Profile feature (4 items)
- [ ] Business feature (4 items)
- [ ] App feature - if still needed (4 items)

---

## 🧹 Phase 6: Global Files Cleanup

After all features migrated:
- [ ] Delete `src/services/api.ts` (RTK Query baseApi)
- [ ] Delete `src/services/appUi.api.ts`
- [ ] Delete `src/services/adminDashboard.api.ts`
- [ ] Delete `src/services/dashboardTables.api.ts`
- [ ] Verify no remaining imports to deleted files

---

## 🏗️ Phase 7: Module Cleanup

Ensure modules contain ONLY UI logic:
- [ ] Audit `src/modules/student/`
- [ ] Audit `src/modules/team/`
- [ ] Audit `src/modules/institute/`  
- [ ] Audit `src/modules/dashboard/`
- [ ] Audit `src/modules/ai/`
- [ ] Audit `src/modules/marketing/`
- [ ] Audit `src/modules/tools/`
- [ ] Move any API calls to features
- [ ] Move any forms to features

---

## ✅ Phase 8: Validation & Testing

### Code Quality Checks
- [ ] No `createAsyncThunk` in codebase
- [ ] No `createApi` from Redux Toolkit/Query
- [ ] Redux store only has `auth` and `ui` slices
- [ ] All data fetches via React Query hooks
- [ ] No `services/` or `repositories/` folders exist
- [ ] All imports from `@/features/[feature]` (not old paths)
- [ ] No `any` types in api.ts files
- [ ] All types properly defined

### Feature Testing
- [ ] Student list loads correctly
- [ ] Student create/update/delete works
- [ ] Course management works
- [ ] Teacher management works
- [ ] Batch management works
- [ ] Fee management works
- [ ] Lead management works
- [ ] All filters and pagination work
- [ ] Error handling displays properly
- [ ] Loading states show correctly

### Integration Testing
- [ ] `npm test` passes (unit tests)
- [ ] `npm run test:e2e` passes (end-to-end)
- [ ] `npm run load-test` passes (performance)

### Performance Metrics
- [ ] Bundle size reduced (estimate: ~80KB)
- [ ] Dashboard load time < 2s
- [ ] API response time < 500ms
- [ ] No unnecessary re-renders in React DevTools

---

## 📊 Progress Tracking Table

| Phase | Feature | Status | % | Days |
|-------|---------|--------|-------|------|
| 0 | Infrastructure | ✅ Done | 100% | 0.5 |
| 1 | Auth | ✅ Done | 80% | 1.0 |
| 1 | Student | ✅ Done | 50% | 0.5 |
| 2 | Course | ⬜ Ready | 0% | 0.75 |
| 2 | Teacher | ⬜ Ready | 0% | 0.75 |
| 2 | Batch | ⬜ Ready | 0% | 0.75 |
| 2 | Fee | ⬜ Ready | 0% | 1.0 |
| 2 | Lead | ⬜ Ready | 0% | 0.75 |
| 3 | Team | ⬜ Ready | 0% | 0.5 |
| 3 | Billing | ⬜ Ready | 0% | 0.75 |
| 3 | Subscription | ⬜ Ready | 0% | 0.75 |
| 3 | Institute | ⬜ Ready | 0% | 0.75 |
| 3 | Attendance | ⬜ Ready | 0% | 0.5 |
| 4 | WhatsApp | ⬜ Ready | 0% | 0.5 |
| 4 | Integration | ⬜ Ready | 0% | 0.5 |
| 4 | Notes | ⬜ Ready | 0% | 0.5 |
| 4 | Dashboard | ⬜ Complex | 0% | 1.0 |
| 5 | Profile | ⬜ Ready | 0% | 0.5 |
| 5 | Business | ⬜ Ready | 0% | 0.5 |
| 5 | App | ⬜ Ready | 0% | 0.5 |
| 6 | Cleanup | ⬜ Ready | 0% | 0.5 |
| 7 | Modules | ⬜ Ready | 0% | 1.0 |
| 8 | Testing | ⬜ Ready | 0% | 2.0 |
| **TOTAL** | | | **10%** | **~14 hours** |

---

## 🎯 Immediate Next Steps (Action Items)

### TODAY:
1. [ ] Cleanup auth feature (delete old files)
2. [ ] Find and update all student components
3. [ ] Test student feature end-to-end

### THIS WEEK:
1. [ ] Migrate course feature (high impact)
2. [ ] Migrate teacher feature
3. [ ] Migrate batch feature
4. [ ] Update related components

### NEXT WEEK:
1. [ ] Migrate fee and lead features
2. [ ] Delete old RTK Query files
3. [ ] Complete phase 2

---

## 📝 Notes & Observations

- Each feature typically takes 45-60 minutes to migrate
- Student feature is good reference implementation
- Components need to be updated after each feature migration
- Testing after each phase is critical
- Bundle size will reduce significantly once old Redux removed

---

## Quick Reference: File Locations

**New Architecture**:
- `features/[feature]/types.ts` — Type definitions
- `features/[feature]/api.ts` — React Query hooks
- `features/[feature]/hooks.ts` — Custom hooks
- `features/[feature]/index.ts` — Barrel exports

**To Delete**:
- `features/[feature]/services/`
- `features/[feature]/repositories/`
- `features/[feature]/[feature]Slice.ts` (Redux)
- `src/services/api.ts`
- `src/services/appUi.api.ts`
- `src/services/adminDashboard.api.ts`
- `src/services/dashboardTables.api.ts`

