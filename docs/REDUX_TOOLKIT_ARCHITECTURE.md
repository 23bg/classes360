#!/usr/bin/env node
/**
 * Redux Toolkit Architecture with createAsyncThunk
 * 
 * This is the scalable Redux architecture for Classes360 SaaS.
 * It uses Redux Toolkit with createAsyncThunk for all async operations.
 * 
 * Features implemented: Student, Batch, Course (templates)
 * ==============================================
 */

# Redux Toolkit Architecture Overview

## Architecture Pattern

```
Feature/
├── [feature]Api.ts       ← Isolated API calls
├── [feature]Types.ts     ← Type definitions & initial state
├── [feature]Slice.ts     ← Thunks + Reducer + Actions
├── [feature]Hooks.ts     ← Custom hooks for components
├── [feature]Selectors.ts ← Memoized selectors
└── index.ts              ← Barrel exports
```

## Core Principles

### 1. **Single Responsibility**
- **API Layer** (`studentApi.ts`): ONLY HTTP calls, no state logic
- **Thunks** (`studentSlice.ts`): ONLY async operations, wrapped error handling
- **Reducers** (`studentSlice.ts`): ONLY state updates, pure functions
- **Hooks** (`studentHooks.ts`): ONLY component convenience, zero state logic
- **Selectors** (`studentSelectors.ts`): ONLY memoized extractors, performance focus

### 2. **Async Thunks Pattern**
Every CRUD operation follows this structure:

```typescript
export const createStudent = createAsyncThunk<
  StudentType,              // Return type (success)
  CreateStudentPayload,     // Argument type (input)
  { rejectValue: string }   // Error type (always string)
>(
  'student/createStudent',  // Unique action name
  async (payload, { rejectWithValue }) => {
    try {
      return await studentApi.createStudent(payload);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed');
    }
  }
);
```

### 3. **State Structure**
Each feature has this consistent shape:

```typescript
{
  items: [],              // Array of items
  total: number,          // Pagination total
  page: number,           // Current page
  limit: number,          // Items per page
  
  selectedItem: null,     // Single item detail view
  
  listLoading: false,     // Fetch list status
  detailLoading: false,   // Fetch detail status
  creating: false,        // Create operation status
  updating: false,        // Update operation status
  deleting: false,        // Delete operation status
  
  listError: null,        // Fetch list error
  detailError: null,      // Fetch detail error
  createError: null,      // Create operation error
  updateError: null,      // Update operation error
  deleteError: null,      // Delete operation error
  
  currentFilters: {}      // Active filter state
}
```

### 4. **Hook Layer Pattern**
Three specialized hooks per feature:

```typescript
// For listing with pagination/filtering
const { students, total, loading, error, loadStudents, setFilters, setPage } = useStudentList();

// For single item details
const { student, loading, error, loadStudent } = useStudentDetail();

// For mutations (create/update/delete)
const { creating, updating, deleting, createError, updateError, deleteError,
        createStudent, updateStudent, deleteStudent } = useStudentMutations();

// Combined convenience hook (everything)
const { students, creating, updateStudent, ... } = useStudent();
```

### 5. **Selector Layer Pattern**
Memoized selectors for optimal performance:

```typescript
// Single values
selectStudentList(state)         // Returns array
selectStudentLoading(state)      // Returns booleans object
selectIsStudentListLoading(state) // Returns boolean

// Factory selectors (per-ID filtering)
selectStudentByIdFactory(id)     // Returns student or undefined
selectStudentsByBatch(batchId)   // Returns filtered array

// Computed selectors
selectStudentCount(state)        // Returns array length
selectStudentErrors(state)       // Returns all error states
```

## Data Flow

```
Component
    ↓
  Hook (useStudent)
    ↓
Dispatch Thunk (fetchStudents)
    ↓
API Call (studentApi.fetchStudents)
    ↓
HTTP Request
    ↓ (response)
Thunk Handler (fulfilled/rejected)
    ↓
Reducer Updates State
    ↓
Component Re-renders (useSelector)
```

## Error Handling Strategy

### Thunk Level (Network errors)
```typescript
try {
  return await studentApi.createStudent(payload);
} catch (error: any) {
  // Always return consistent error format
  return rejectWithValue(error.response?.data?.message || 'Failed to create student');
}
```

### Reducer Level (State updates)
```typescript
.addCase(createStudent.rejected, (state, action) => {
  state.creating = false;
  state.createError = action.payload || 'Failed to create student';
});
```

### Component Level (Display errors)
```typescript
const { error, creating, createStudent } = useStudentMutations();

// Show error with retry
{error && (
  <Alert>{error}</Alert>
)}

// Disable button while loading
<Button disabled={creating}>Create</Button>
```

## Store Configuration

The Redux store includes:

```typescript
{
  auth: { user, role, isAuthenticated },        // Minimal auth state
  ui: { sidebarOpen, mobileMenuOpen, ... },     // UI state only
  student: { items, total, loading, ... },      // Student CRUD
  batch: { items, total, loading, ... },        // Batch CRUD
  course: { items, total, loading, ... },       // Course CRUD
  // ... add more features following same pattern
}
```

## Performance Optimizations

### 1. **Memoized Selectors**
All selectors are memoized to prevent unnecessary component re-renders:

```typescript
// Good - component only re-renders if items actually change
const students = useSelector(selectStudentList);

// Avoid - creates new array every time, causes re-renders
const students = useSelector(state => state.student.items);
```

### 2. **Normalized State**
Items stored as flat array with pagination info to avoid nesting:

```typescript
// Good
{
  items: [{ id, name, ... }, ...],
  total: 100,
  page: 1
}

// Avoid (bad for large lists)
{
  items: {
    id1: { name, ... },
    id2: { name, ... },
    ...
  }
}
```

### 3. **Separate Loading States**
Independent loading flags for each operation:

```typescript
const { 
  listLoading,    // For fetch list
  detailLoading,  // For fetch
  creating,       // For create
  updating,       // For update
} = useStudentMutations();

// Allows fine-grained UI feedback
<Button disabled={creating}>Create</Button>
<div>{listLoading && <Spinner />}</div>
```

## Validation & Type Safety

Every feature is fully typed:

```typescript
// Strong typing from API to component
interface CreateStudentPayload { ... }
interface StudentType { ... }
interface StudentState { ... }

const payloadStudentAsync: CreateStudentPayload = { 
  // IDE autocomplete available
  // Type errors caught at compile time
};
```

## Adding New Features

To add a new feature (e.g., `Teacher`):

1. Copy `student/` folder structure
2. Replace "Student" → "Teacher"
3. Update endpoints: `/v1/teachers`
4. Update types to match API response
5. Import in `store.ts`
6. Use `useTeacher()` hook in components

See `REDUX_FEATURE_TEMPLATE.md` for complete copy-paste template.

---

## 📁 File Structure (Completed)

```
✅ COMPLETED:
   src/features/
   ├── student/
   │   ├── studentApi.ts
   │   ├── studentTypes.ts
   │   ├── studentSlice.ts (with thunks)
   │   ├── studentHooks.ts
   │   ├── studentSelectors.ts
   │   └── index.ts
   │
   ├── batch/
   │   ├── batchApi.ts
   │   ├── batchTypes.ts
   │   ├── batchSlice.ts (with thunks)
   │   ├── batchHooks.ts
   │   ├── batchSelectors.ts
   │   └── index.ts
   │
   ├── course/
   │   ├── courseApi.ts
   │   ├── courseTypes.ts
   │   ├── courseSlice.ts (with thunks)
   │   ├── courseHooks.ts
   │   ├── courseSelectors.ts
   │   └── index.ts
   │
   └── [auth, ui, ...other features]

   src/lib/
   └── store.ts (Updated with batch + course slices)
```

---

## 🎯 Next Steps

1. **Review** the Student feature implementation (complete example)
2. **Copy** the Batch/Course templates for other features
3. **Use** the `useStudent()` hook pattern in components
4. **Migrate** remaining 16 features using template

Each feature migration takes ~45-60 minutes following the pattern.

Total remaining work: ~12-14 hours
