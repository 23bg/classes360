# 🚀 ARCHITECTURE REFACTOR - EXECUTION GUIDE

## Current Progress

✅ **Infrastructure Setup**
- React Query configured (`lib/api/client.ts`, `lib/api/query-client.ts`)
- QueryProvider added to root layout
- Redux simplified (only `auth` + `ui` slices)
- ReduxProvider moved to dashboard layout

✅ **Features Refactored** (Example Pattern)
- `features/auth/` - Minimal Redux + React Query hooks
- `features/student/` - Complete pattern with types, api, hooks, index
- `features/ui/` - UI state Redux slice

---

## Migration Pattern for Remaining Features

### For Each Feature, Follow These Steps:

#### **Step 1: Create `types.ts`**
Define all TypeScript interfaces for the feature.

**File**: `features/[feature]/types.ts`
```typescript
export interface [Feature]Type { ... }
export interface Create[Feature]Input { ... }
export interface Update[Feature]Input { ... }
```

#### **Step 2: Create `api.ts` with React Query Hooks**
Convert all services/repositories logic to React Query hooks.

**File**: `features/[feature]/api.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

const [FEATURE]_QUERY_KEY = ['[feature]'];

export const useGet[Features] = () => useQuery(...);
export const useGet[Feature] = (id) => useQuery(...);
export const useCreate[Feature] = () => useMutation(...);
export const useUpdate[Feature] = () => useMutation(...);
export const useDelete[Feature] = () => useMutation(...);
```

#### **Step 3: Create `hooks.ts` for Custom Hooks**
Any filtering, pagination, or custom logic.

**File**: `features/[feature]/hooks.ts`
```typescript
export const use[Feature]Filters = () => { ... };
export const use[Feature]Pagination = () => { ... };
```

#### **Step 4: Create `index.ts` (Barrel Export)**
```typescript
export * from './api';
export * from './hooks';
export type * from './types';
```

#### **Step 5: Delete Old Files**
- `features/[feature]/services/` → DELETE
- `features/[feature]/repositories/` → DELETE
- `features/[feature]/[feature]Slice.ts` (if Redux) → DELETE

#### **Step 6: Update Components**
- Remove Redux `useDispatch` and `useSelector`
- Import hooks from `@/features/[feature]`
- Use React Query hooks directly

---

## Features to Migrate (in Priority Order)

### 🟢 Priority 1: Core Features (High Impact)
1. **course** - Used in dashboard overview
2. **teacher** - Used in dashboard overview
3. **batch** - Used in dashboard, student management
4. **fee** - Used in billing, dashboard
5. **lead** - Used in CRM, dashboard

### 🟡 Priority 2: Secondary Features
6. **team** - User management
7. **billing** - Subscription management
8. **subscription** - Plan management
9. **institute** - Profile management
10. **attendance** - Attendance tracking

### 🔵 Priority 3: Integration Features
11. **whatsapp** - WhatsApp integration
12. **integration** - Third-party integrations
13. **notes** - Note-taking
14. **dashboard** - Dashboard overview (complex aggregations)

### ⚪ Priority 4: Cleanup Features
15. **profile** - User profile
16. **business** - Business onboarding
17. **app** - App state (if still needed)

---

## Quick Reference: Service to React Query Conversion

### Before (Service + Repository + Redux)
```typescript
// features/course/services/course.service.ts
export const courseService = {
  async getAll(instituteId: string) {
    return courseRepository.findByInstitute(instituteId);
  },
  async create(data) { ... },
  async update(id, data) { ... },
};

// features/course/repositories/course.repo.ts
export const courseRepository = {
  findByInstitute: async (id) => 
    prisma.course.findMany({ where: { instituteId: id } }),
  create: async (data) => prisma.course.create({ data }),
  // ...
};

// Component
const dispatch = useDispatch();
const { data, loading } = useSelector(state => state.course);
useEffect(() => {
  dispatch(fetchCourses(instituteId));
}, [instituteId, dispatch]);
```

### After (React Query Only)
```typescript
// features/course/api.ts
export const useGetCourses = (instituteId: string) =>
  useQuery({
    queryKey: ['courses', instituteId],
    queryFn: () => api.get(`/v1/courses`, { params: { instituteId } }),
  });

export const useCreateCourse = () =>
  useMutation({
    mutationFn: (data) => api.post(`/v1/courses`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

// Component
const { data: courses, isLoading } = useGetCourses(instituteId);
const { mutate: createCourse, isPending } = useCreateCourse();
```

---

## Step-by-Step Bulk Migration

### Phase A: Course Feature
1. Create `features/course/types.ts`
2. Create `features/course/api.ts` (migrate courseService + courseRepository)
3. Create `features/course/hooks.ts` (if needed)
4. Create `features/course/index.ts`
5. Find and update components using course data
6. Test course functionality
7. Delete `features/course/services/` and `repositories/`

### Phase B: Teacher Feature
(Same steps as Course)

### Phase C: Batch Feature
(Same steps as Course, but includes relations)

### Phase D: Fee & Billing
(Complex - may have aggregations)

### Phase E: Lead & Remaining Features
(Repeat pattern for each)

### Phase F: Cleanup
1. Delete all `src/services/api.ts`, `appUi.api.ts`, `adminDashboard.api.ts`, `dashboardTables.api.ts`
2. Delete `dashboardSlice.ts`
3. Delete `appSlice.ts` (if unused)
4. Run tests and load tests

---

## Component Update Examples

### Example 1: Student List Component

**Before** (Redux + Service):
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { fetchStudents } from '@/features/student/studentSlice';

function StudentListPage() {
  const dispatch = useDispatch();
  const { data: students, loading } = useSelector(s => s.student);
  const instituteId = useAuth().user.instituteId;

  useEffect(() => {
    dispatch(fetchStudents(instituteId));
  }, [instituteId, dispatch]);

  if (loading) return <Spinner />;
  return <StudentTable data={students} />;
}
```

**After** (React Query):
```typescript
import { useGetStudents } from '@/features/student';
import { useAuth } from '@/features/auth';

function StudentListPage() {
  const { user } = useAuth();
  const { data, isLoading } = useGetStudents(user?.institute_id);

  if (isLoading) return <Spinner />;
  return <StudentTable data={data?.data} />;
}
```

### Example 2: Create Student Mutation

**Before** (Redux):
```typescript
const { mutate: createStudent } = useDispatch();

const handleCreate = async (data) => {
  dispatch(createStudentThunk(data));
};
```

**After** (React Query):
```typescript
const { mutate: createStudent, isPending } = useCreateStudent();

const handleCreate = (data) => {
  createStudent(data, {
    onSuccess: () => {
      toast.success('Student created!');
      navigate('/students');
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
};
```

---

## Testing Checklist

After migrating each feature:
- [ ] Component renders without errors
- [ ] Data loads correctly
- [ ] Create/update/delete mutations work
- [ ] Filters and pagination work
- [ ] Error handling works
- [ ] Loading states show correctly
- [ ] Refetch on focus works
- [ ] Optimistic updates work (if applicable)

---

## File Deletion Checklist

After all features migrated:
```
DELETE:
- src/services/api.ts ❌
- src/services/appUi.api.ts ❌
- src/services/adminDashboard.api.ts ❌
- src/services/dashboardTables.api.ts ❌
- src/features/dashboard/dashboardSlice.ts ❌
- src/features/app/appSlice.ts ❌
- src/features/*/services/ folders ❌
- src/features/*/repositories/ folders ❌
```

---

## Validation Points

### Before Commit:
1. **No createAsyncThunk** - Search codebase for "createAsyncThunk"
2. **No Redux API calls** - Search for "useDispatch" in mutation contexts
3. **All queries use React Query** - All data fetches via useQuery/useMutation
4. **No services/repositories** - These folders should not exist
5. **Import paths** - All imports from `@/features/[feature]`
6. **Type safety** - No `any` types in api.ts files

### Run Tests:
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Load tests
npm run load-test
```

---

## Timeline Estimate

- **Setup** (Done): 30 min
- **Auth + Student** (Done): 1 hour
- **Priority 1 Features** (5 features × 45 min): 3.75 hours
- **Priority 2 Features** (5 features × 30 min): 2.5 hours
- **Priority 3 Features** (4 features × 30 min): 2 hours
- **Cleanup + Testing**: 2 hours

**Total: ~12 hours of focused work**

---

## NEXT STEPS

1. ✅ Setup infrastructure
2. ✅ Refactor auth feature
3. ✅ Create student example
4. → Proceed with Priority 1 features (course, teacher, batch, fee, lead)
5. → Continue Priority 2 and 3
6. → Final cleanup and testing

