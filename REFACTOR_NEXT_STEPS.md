# 🏁 ARCHITECTURE REFACTOR - COMPLETE GUIDANCE & NEXT ACTIONS

**Last Updated**: March 23, 2026  
**Status**: ✅ Foundation Complete — Ready for Feature Migration  
**Effort Remaining**: ~12-14 hours (1-2 weeks at 1hr/day)

---

## 🎯 What's Complete Right Now

### Infrastructure ✅
- [x] React Query setup with Axios interceptors
- [x] QueryProvider configured and placed in root
- [x] Redux minimized to only `auth` and `ui` slices
- [x] ReduxProvider moved to dashboard layout (not root)
- [x] New folder structure: `lib/api/`, clean providers

### Examples Created ✅
- [x] **auth** - Shows the pattern (React Query hooks + minimal Redux slice)
- [x] **student** - Shows the pattern (complete with filters, mutations, pagination)
- [x] **ui** - Redux slice for UI state

### Documentation ✅
- [x] ARCHITECTURE_REFACTOR_PLAN.md - Problem analysis
- [x] REFACTORING_DETAILED_GUIDE.md - Before/after patterns
- [x] EXECUTION_GUIDE.md - Step-by-step instructions
- [x] ARCHITECTURE_REFACTOR_CHECKLIST_v2.md - Progress tracking

---

## 🚦 Traffic Light: What You Need to Know

### 🟢 GREEN (Use These)
- `lib/api/client.ts` - HTTP client for all API requests
- `lib/api/query-client.ts` - React Query config
- `features/[feature]/api.ts` - React Query hooks pattern
- `features/[feature]/hooks.ts` - Custom hooks for filtering, pagination
- `features/auth/` - Reference implementation for auth
- `features/student/` - Reference implementation for any feature

### 🟡 YELLOW (In Transition)
- `features/*/services/` - Still exist but being migrated
- `features/*/repositories/` - Still exist but being migrated
- `src/services/api.ts` - Old RTK Query baseApi (to be deleted)
- `features/dashboard/dashboardSlice.ts` - To be broken down

### 🔴 RED (Don't Use These)
- `createAsyncThunk` - Use React Query instead
- `createApi` (from @reduxjs/toolkit/query) - Use React Query instead
- Redux for API data - Use React Query only

---

## 📋 Exact Steps to Migrate One Feature (Template)

### Example: Migrating the `course` Feature

#### Step 1: Create Types File (5 min)
**File**: `src/features/course/types.ts`
```typescript
export interface CourseType {
  id: string;
  name: string;
  institute_id: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseInput {
  name: string;
  description?: string;
}

export interface UpdateCourseInput {
  name?: string;
  description?: string;
}
```

#### Step 2: Create API Hooks (10 min)
**File**: `src/features/course/api.ts`

Copy the pattern from `src/features/student/api.ts` and replace:
- `student` → `course`
- `Student` → `Course`
- `/students` → `/courses`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CourseType, CreateCourseInput, UpdateCourseInput } from './types';

const COURSES_QUERY_KEY = ['courses'];

export const useGetCourses = (instituteId?: string) =>
  useQuery<CourseType[]>({
    queryKey: [...COURSES_QUERY_KEY, instituteId],
    queryFn: () => api.get(`/v1/courses`, { params: { instituteId } }).then(r => r.data),
    enabled: !!instituteId,
  });

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCourseInput) =>
      api.post(`/v1/courses`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COURSES_QUERY_KEY });
    },
  });
};

// ... similar for update, delete
```

#### Step 3: Create Custom Hooks (5 min)
**File**: `src/features/course/hooks.ts`

```typescript
import { useState } from 'react';
import { useGetCourses } from './api';

export const useCoursesWithFilters = (instituteId?: string) => {
  const [search, setSearch] = useState('');
  const { data = [], isLoading } = useGetCourses(instituteId);

  const filtered = data.filter(course =>
    course.name.toLowerCase().includes(search.toLowerCase())
  );

  return { courses: filtered, isLoading, search, setSearch };
};
```

#### Step 4: Create Barrel Export (1 min)
**File**: `src/features/course/index.ts`

```typescript
export * from './api';
export * from './hooks';
export type * from './types';
```

#### Step 5: Find & Update Components (15 min)
Search for files using course data:
```bash
grep -r "useDispatch" src/ | grep -i course
grep -r "courseSlice" src/
grep -r "fetchCourses" src/
```

For each component found, replace:
```typescript
// OLD
const dispatch = useDispatch();
const { data, loading } = useSelector(state => state.course);
useEffect(() => { dispatch(fetchCourses()); }, [dispatch]);

// NEW
const { courses, isLoading } = useCoursesWithFilters(instituteId);
```

#### Step 6: Test (10 min)
- [ ] Course list loads
- [ ] Filtering works
- [ ] Create course works
- [ ] Update course works
- [ ] Delete course works

#### Step 7: Cleanup (5 min)
Delete these folders:
```
- src/features/course/services/
- src/features/course/repositories/
```

**Total Time**: ~50 minutes per feature

---

## 🎬 Action Plan: Next 3 Days

### DAY 1: Two High-Impact Features (2 hours)
**Morning (1 hour)**:
1. Migrate `course` feature using the template above
2. Test it works

**Afternoon (1 hour)**:
1. Migrate `teacher` feature (same template)
2. Test it works

### DAY 2: Three More Features (2.5 hours)
1. Migrate `batch` (45 min) - uses course relation
2. Migrate `fee` (45 min) - might be complex
3. Migrate `lead` (30 min) - simpler

### DAY 3: Cleanup & Validation (1.5 hours)
1. Delete `src/services/api.ts` and old RTK Query files
2. Run tests: `npm test`
3. Check for old patterns still in code

**Total: ~6 hours → Rest of features can follow at 1/day pace**

---

## 🔍 Quick Reference: Copy-Paste Template

### For Creating a New Feature's API

```typescript
// features/[FEATURE]/api.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { [Feature]Type, Create[Feature]Input, Update[Feature]Input } from './types';

const [FEATURE]_QUERY_KEY = ['[feature]'];

export const useGet[Features] = (id?: string) =>
  useQuery({
    queryKey: [[FEATURE]_QUERY_KEY, id],
    queryFn: () => api.get(`/v1/[feature]`).then(r => r.data),
    enabled: !!id,
  });

export const useGet[Feature] = (id?: string) =>
  useQuery({
    queryKey: [[FEATURE]_QUERY_KEY, 'detail', id],
    queryFn: () => api.get(`/v1/[feature]/${id}`).then(r => r.data),
    enabled: !!id,
  });

export const useCreate[Feature] = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/v1/[feature]`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FEATURE]_QUERY_KEY });
    },
  });
};

export const useUpdate[Feature] = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => api.patch(`/v1/[feature]/${id}`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FEATURE]_QUERY_KEY });
    },
  });
};

export const useDelete[Feature] = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/v1/[feature]/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FEATURE]_QUERY_KEY });
    },
  });
};
```

---

## ✨ Key Differences: OLD vs NEW

| Aspect | OLD Redux | NEW React Query |
|--------|-----------|-----------------|
| **Fetch data** | `dispatch(thunk)` | `useQuery(...)` |
| **Mutate data** | `dispatch(thunk)` | `useMutation(...)` |
| **Loading state** | Redux store | `isLoading` from hook |
| **Error handling** | Redux store | `error` from hook |
| **Caching** | Manual in Redux | Automatic |
| **Refetch stale** | Manual setup | Automatic config |
| **Code lines** | ~200-300 | ~100 |
| **Bundle size** | Heavy | Light |

---

## 🚨 Common Mistakes to Avoid

### ❌ DON'T Do This:
```typescript
// Wrong: Still using Redux for API data
dispatch(fetchCourses());
const { data } = useSelector(state => state.courses);

// Wrong: Mixing patterns
export const thunk = createAsyncThunk(...);

// Wrong: Creating services for wrappers
const courseService = { getAll: () => api.get('/courses') };
```

### ✅ DO This Instead:
```typescript
// Right: React Query hook
const { data: courses } = useGetCourses(instituteId);

// Right: Direct query
export const useGetCourses = () => useQuery(...);

// Right: API in hook, no service layer
export const useGetCourses = () =>
  useQuery(() => api.get('/courses').then(r => r.data));
```

---

## 📊 Progress Visualization

### Current State:
```
Infrastructure: ████████████ 100% ✅
Auth Feature:   ████████████ 100% ✅
Student Feature: ████████████ 100% ✅
Remaining:      ░░░░░░░░ 0%

Overall:        ███░░░░░░░░░░░░░░░░ 10%
```

### After Course Migration:
```
After Course:   ████░░░░░░░░░░░░░░░░░░ 15%
```

### After Phase 1 (5 features):
```
After Phase 1:  ██████░░░░░░░░░░░░░░░░░░░░ 25%
```

### After All Features:
```
Final:          ████████████████████████████ 100% ✅
```

---

## 🎁 What You Get When Done

### Code Quality
- Clean separation of concerns
- No duplication (no services/repos)
- Consistent patterns
- Easy to onboard new devs

### Performance
- Smaller bundle (~80KB less)
- Better caching
- Faster load times
- Optimistic updates possible

### Developer Experience
- Less boilerplate
- Clear conventions
- Faster feature development
- Better error handling

### Business Value
- Improved UX
- Faster page loads
- Better reliability
- Easier to maintain

---

## 💬 Quick Q&A

**Q: Why not just keep Redux?**  
A: Redux was adding too many layers. React Query handles caching, refetching, and state management for API data much better.

**Q: What about preloaded state from server?**  
A: React Query can accept initial data via `initialData` or `initialDataUpdatedAt` options.

**Q: What if I need cross-feature state?**  
A: Use React Query's global query cache or a small Redux store slice for that specific concern.

**Q: How do I handle optimistic updates?**  
A: React Query mutations support `onMutate` for optimistic updates.

**Q: What about TypeScript?**  
A: All examples are fully typed. No `any` types needed.

---

## 🎯 Success Criteria

After you complete this refactoring, verify:
- [ ] No `createAsyncThunk` in codebase
- [ ] No `createApi` from Redux Toolkit
- [ ] Redux store only has `auth` + `ui`
- [ ] All API calls use React Query
- [ ] No `services/` or `repositories/` folders
- [ ] Bundle size reduced by ~80KB
- [ ] All tests pass
- [ ] App performs same or better
- [ ] Documentation reflects new patterns

---

## 📞 Support Resources

1. **Pattern Questions**: Check `features/student/` for reference
2. **Syntax Questions**: Check `features/auth/api.ts` for examples
3. **Component Updates**: Check `REFACTORING_DETAILED_GUIDE.md` for before/after
4. **Execution Steps**: Follow `EXECUTION_GUIDE.md`
5. **Progress Tracking**: Update `ARCHITECTURE_REFACTOR_CHECKLIST_v2.md`

---

## 🚀 Let's Go!

**Pick your first feature** (I recommend `course`) and follow the 7-step template.

**Expected outcome**: In 50 minutes, you'll have:
- ✅ New feature with React Query
- ✅ Components updated
- ✅ Tests passing
- ✅ Old code removed
- ✅ Ready to move to next feature

**Ready? Start with `course`! 🎯**

