# 🔧 DETAILED REFACTORING GUIDE & EXAMPLES

## Part 1: Before vs After - Student Feature

### ❌ BEFORE (Current Bad Architecture)

#### File: `features/student/services/student.service.ts`
```typescript
import { studentRepository } from "./repositories/student.repo";

export const studentService = {
  async getAll(instituteId: string) {
    return studentRepository.findByInstitute(instituteId);
  },

  async create(instituteId: string, data: CreateStudentInput) {
    return studentRepository.create(instituteId, data);
  },

  async update(id: string, data: UpdateStudentInput) {
    return studentRepository.update(id, data);
  },
};
```

#### File: `features/student/repositories/student.repo.ts`
```typescript
import { prisma } from "@/lib/db/prisma";

export const studentRepository = {
  findByInstitute: async (instituteId: string) =>
    prisma.student.findMany({ where: { instituteId } }),

  create: async (instituteId: string, data) =>
    prisma.student.create({ data: { ...data, instituteId } }),

  update: async (id: string, data) =>
    prisma.student.update({ where: { id }, data }),
};
```

#### File: `features/dashboard/dashboardSlice.ts`
```typescript
export const fetchOverview = createAsyncThunk(
  'dashboard/fetchOverview',
  async (instituteId: string) => {
    const data = await Promise.all([
      studentService.getAll(instituteId),
      courseService.getAll(instituteId),
      feeService.getAll(instituteId),
      teacherService.getAll(instituteId),
    ]);
    return {
      students: data[0],
      courses: data[1],
      fees: data[2],
      teachers: data[3],
    };
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { overview: null, loading: false },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOverview.pending, (state) => { state.loading = true; })
      .addCase(fetchOverview.fulfilled, (state, action) => {
        state.overview = action.payload;
        state.loading = false;
      });
  },
});
```

#### Usage in Component:
```typescript
function DashboardPage() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.dashboard);

  useEffect(() => {
    dispatch(fetchOverview(instituteId));
  }, [instituteId, dispatch]);

  if (loading) return <Spinner />;
  return <Overview data={data} />;
}
```

### ✅ AFTER (Clean Architecture)

#### File: `features/student/api.ts` (React Query)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { StudentType, CreateStudentInput, UpdateStudentInput } from './types';

// Queries
export const useGetStudents = (instituteId: string) =>
  useQuery<StudentType[]>({
    queryKey: ['students', instituteId],
    queryFn: () =>
      api.get(`/institutes/${instituteId}/students`).then(res => res.data),
    enabled: !!instituteId,
  });

export const useGetStudent = (id: string) =>
  useQuery<StudentType>({
    queryKey: ['students', id],
    queryFn: () => api.get(`/students/${id}`).then(res => res.data),
    enabled: !!id,
  });

// Mutations
export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ instituteId, data }: { instituteId: string; data: CreateStudentInput }) =>
      api.post(`/institutes/${instituteId}/students`, data).then(res => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['students', variables.instituteId],
      });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStudentInput }) =>
      api.patch(`/students/${id}`, data).then(res => res.data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['students', variables.id],
      });
    },
  });
};

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/students/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['students'],
      });
    },
  });
};
```

#### File: `features/student/hooks.ts` (Custom Hooks)
```typescript
import { useState } from 'react';
import { useGetStudents } from './api';

// Custom hook for student filtering and pagination
export const useStudentFilters = () => {
  const [filters, setFilters] = useState({
    search: '',
    batch: '',
    status: 'active',
    page: 1,
    limit: 20,
  });

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 1 }));
  };

  const handleBatchFilter = (batchId: string) => {
    setFilters(prev => ({ ...prev, batch: batchId, page: 1 }));
  };

  return { filters, handleSearch, handleBatchFilter, setFilters };
};

// Custom hook combining query + filters
export const useStudentsWithFilters = (instituteId: string) => {
  const { filters, ...filterControls } = useStudentFilters();
  const { data, isLoading, error } = useGetStudents(instituteId);

  const filtered = data?.filter(student => {
    if (filters.search && !student.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.batch && student.batchId !== filters.batch) {
      return false;
    }
    return true;
  }) ?? [];

  return {
    students: filtered,
    isLoading,
    error,
    filters,
    ...filterControls,
  };
};
```

#### File: `features/student/types.ts`
```typescript
export interface StudentType {
  id: string;
  name: string;
  email: string;
  phone: string;
  batchId: string;
  instituteId: string;
  status: 'active' | 'inactive' | 'graduated';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStudentInput {
  name: string;
  email: string;
  phone: string;
  batchId: string;
}

export interface UpdateStudentInput {
  name?: string;
  email?: string;
  phone?: string;
  batchId?: string;
  status?: 'active' | 'inactive' | 'graduated';
}
```

#### File: `features/student/index.ts` (Barrel Export)
```typescript
export * from './api';
export * from './hooks';
export * from './types';
```

#### Usage in Component (CLEAN!):
```typescript
'use client';

import { useStudentsWithFilters } from '@/features/student';

function StudentListPage({ instituteId }: { instituteId: string }) {
  const {
    students,
    isLoading,
    filters,
    handleSearch,
  } = useStudentsWithFilters(instituteId);

  return (
    <div>
      <input
        placeholder="Search students"
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={filters.search}
      />
      {isLoading ? (
        <Spinner />
      ) : (
        <StudentTable data={students} />
      )}
    </div>
  );
}
```

---

## Part 2: React Query Setup

### File: `lib/api/client.ts` (New)
```typescript
import axios from 'axios';
import { env } from '@/lib/config/env';

const baseURL = env.NEXT_PUBLIC_API_URL || '/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true, // Include cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  // Token is in HttpOnly cookie, so this is automatic
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${baseURL}/auth/refresh`);
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

### File: `lib/api/query-client.ts` (New)
```typescript
import { QueryClient } from '@tanstack/react-query';

export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10,   // 10 minutes
        retry: 1,
        refetchOnWindowFocus: true,
      },
      mutations: {
        retry: 1,
      },
    },
  });

export const queryClient = createQueryClient();
```

### File: `app/layout.tsx` (Updated)
```typescript
'use client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/api/query-client';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {/* Keep other providers like theme, i18n */}
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

### File: `app/(dashboard)/layout.tsx` (Updated)
```typescript
'use client';

import { Provider as ReduxProvider } from 'react-redux';
import { store } from '@/lib/store';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReduxProvider store={store}>
      {children}
    </ReduxProvider>
  );
}
```

---

## Part 3: Redux Minimal Structure

### File: `features/auth/authSlice.ts` (Minimal)
```typescript
import { createSlice } from '@reduxjs/toolkit';

interface AuthState {
  user: {
    id: string;
    email: string;
    institute_id: string;
  } | null;
  role: 'OWNER' | 'EDITOR' | 'VIEWER' | 'MANAGER' | null;
}

const initialState: AuthState = {
  user: null,
  role: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.role = null;
    },
  },
});

export const { setUser, setRole, clearAuth } = authSlice.actions;
export default authSlice.reducer;
```

### File: `features/ui/uiSlice.ts` (New)
```typescript
import { createSlice } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  notificationsOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  notificationsOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setMobileMenuOpen: (state, action) => {
      state.mobileMenuOpen = action.payload;
    },
    setNotificationsOpen: (state, action) => {
      state.notificationsOpen = action.payload;
    },
  },
});

export const { toggleSidebar, setMobileMenuOpen, setNotificationsOpen } = uiSlice.actions;
export default uiSlice.reducer;
```

### File: `lib/store.ts` (Updated - Minimal)
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import uiReducer from '@/features/ui/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,    // User session + permissions
    ui: uiReducer,        // UI state (modals, sidebars, etc)
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Part 4: Folder Structure After Refactor

```
src/
├── app/
│   ├── layout.tsx                    # Root + QueryClientProvider
│   ├── (auth)/                       # Public auth routes
│   │   ├── login/
│   │   ├── signup/
│   │   └── ...
│   ├── (marketing)/                  # Public marketing routes (server-rendered)
│   │   ├── page.tsx
│   │   └── ...
│   ├── (dashboard)/
│   │   ├── layout.tsx                # ReduxProvider HERE
│   │   ├── page.tsx
│   │   ├── students/
│   │   ├── courses/
│   │   └── ...
│   └── api/
│       └── v1/
│           ├── auth/
│           ├── students/
│           └── ...
│
├── features/                         # Data layer (React Query)
│   ├── auth/
│   │   ├── api.ts                    # useLogin, useSignup, etc
│   │   ├── authSlice.ts              # Redux minimal
│   │   ├── hooks.ts
│   │   ├── types.ts
│   │   ├── validations/
│   │   └── index.ts
│   ├── student/
│   │   ├── api.ts                    # useGetStudents, useCreateStudent, etc
│   │   ├── hooks.ts                  # useStudentFilters, etc
│   │   ├── types.ts
│   │   └── index.ts
│   ├── course/
│   ├── teacher/
│   ├── batch/
│   ├── fee/
│   ├── lead/
│   ├── team/
│   ├── ui/
│   │   ├── uiSlice.ts
│   │   └── index.ts
│   └── ...
│
├── modules/                          # UI + orchestration
│   ├── student/
│   │   ├── components/               # Pure UI only
│   │   │   ├── StudentCard.tsx
│   │   │   ├── StudentTable.tsx
│   │   │   └── ...
│   │   ├── screens/                  # Page-level orchestration
│   │   │   ├── StudentListScreen.tsx # Uses hooks from features
│   │   │   └── StudentDetailScreen.tsx
│   │   └── forms/
│   │       ├── StudentForm.tsx        # Form validation only
│   │       └── ...
│   ├── team/
│   ├── course/
│   └── ...
│
├── lib/
│   ├── api/
│   │   ├── client.ts                 # Axios instance
│   │   └── query-client.ts           # React Query setup
│   ├── auth/
│   │   ├── auth.ts
│   │   ├── tokens.ts
│   │   └── ...
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useSession.ts
│   │   └── ...
│   ├── utils/
│   ├── config/
│   └── ...
│
├── components/
│   ├── ui/                           # Shadcn/Radix components
│   ├── common/                       # Shared components
│   └── ...
│
├── store.ts                          # Redux (minimal)
├── providers/
│   ├── ReduxProvider.tsx             # Moved to dashboard layout
│   └── ...
└── ...
```

---

## Part 5: Feature Migration Template

### For Each Feature, Follow This Pattern:

#### Step 1: Create `features/[feature]/types.ts`
```typescript
export interface [Feature]Type { ... }
export interface Create[Feature]Input { ... }
export interface Update[Feature]Input { ... }
```

#### Step 2: Create `features/[feature]/api.ts`
```typescript
export const useGet[Features] = () => useQuery(...);
export const useGet[Feature] = (id) => useQuery(...);
export const useCreate[Feature] = () => useMutation(...);
export const useUpdate[Feature] = () => useMutation(...);
export const useDelete[Feature] = () => useMutation(...);
```

#### Step 3: Create `features/[feature]/hooks.ts`
```typescript
export const use[Feature]Filters = () => { ... };
export const use[Feature]Pagination = () => { ... };
```

#### Step 4: Create `features/[feature]/index.ts`
```typescript
export * from './api';
export * from './hooks';
export * from './types';
```

#### Step 5: Delete:
- `features/[feature]/services/`
- `features/[feature]/repositories/`
- `features/[feature]/[feature]Slice.ts` (if exists)

#### Step 6: Update UI Components
- Remove Redux dispatch/selector usage
- Use React Query hooks instead
- Import from `@/features/[feature]`

---

## Part 6: Migration Execution Order

1. **Phase 1** — Auth feature (foundation)
2. **Phase 2** — Student feature (core)
3. **Phase 3** — Batch feature
4. **Phase 4** — Course feature
5. **Phase 5** — Teacher feature
6. **Phase 6** — Fee & Billing features
7. **Phase 7** — Remaining features
8. **Phase 8** — Delete old architecture (services/, repositories/)
9. **Phase 9** — Move ReduxProvider to dashboard
10. **Phase 10** — Update root page for SSR
11. **Phase 11** — Testing + validation

---

