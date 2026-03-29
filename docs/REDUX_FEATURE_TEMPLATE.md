# Redux Feature Template - Copy & Paste

> **Use this when adding a new CRUD feature to the system**
>
> Features to implement: Teacher, Fee, Lead, Team, Billing, Subscription, Institute, Attendance, WhatsApp, Integration, Notes, Dashboard, Profile, Business

---

## Step 1: API Layer (`[feature]Api.ts`)

**Path:** `src/features/[feature]/[feature]Api.ts`

```typescript
import { api } from '@/lib/axios';

/**
 * [FEATURE] API Layer
 * Replace [FEATURE] with your feature name (Teacher, Fee, Lead, etc)
 * Replace /v1/[features] with your actual API endpoint
 */

export interface Fetch[Feature]Params {
  instituteId: string;
  page?: number;
  limit?: number;
  search?: string;
  // Add more filter params as needed
}

export interface Create[Feature]Payload {
  // Define the payload for creating a new item
}

export interface Update[Feature]Payload {
  id: string;
  // Define the payload for updating exist item
}

export const [feature]Api = {
  fetch[Features]: async (params: Fetch[Feature]Params) => {
    const response = await api.get('/v1/[features]', { params });
    return response.data;
  },

  fetch[Feature]ById: async (id: string) => {
    const response = await api.get(`/v1/[features]/${id}`);
    return response.data;
  },

  create[Feature]: async (payload: Create[Feature]Payload) => {
    const response = await api.post('/v1/[features]', payload);
    return response.data;
  },

  update[Feature]: async (payload: Update[Feature]Payload) => {
    const response = await api.patch(`/v1/[features]/${payload.id}`, payload);
    return response.data;
  },

  delete[Feature]: async (id: string) => {
    const response = await api.delete(`/v1/[features]/${id}`);
    return response.data;
  },
};
```

### Example: Teacher Feature

```typescript
export interface FetchTeachersParams {
  instituteId: string;
  departmentId?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export interface CreateTeacherPayload {
  name: string;
  email: string;
  phone?: string;
  departmentId: string;
  instituteId: string;
}

export interface UpdateTeacherPayload {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  departmentId?: string;
}

export const teacherApi = {
  fetchTeachers: async (params: FetchTeachersParams) => {
    const response = await api.get('/v1/teachers', { params });
    return response.data;
  },

  fetchTeacherById: async (id: string) => {
    const response = await api.get(`/v1/teachers/${id}`);
    return response.data;
  },

  createTeacher: async (payload: CreateTeacherPayload) => {
    const response = await api.post('/v1/teachers', payload);
    return response.data;
  },

  updateTeacher: async (payload: UpdateTeacherPayload) => {
    const response = await api.patch(`/v1/teachers/${payload.id}`, payload);
    return response.data;
  },

  deleteTeacher: async (id: string) => {
    const response = await api.delete(`/v1/teachers/${id}`);
    return response.data;
  },
};
```

---

## Step 2: Type Definitions (`[feature]Types.ts`)

**Path:** `src/features/[feature]/[feature]Types.ts`

```typescript
export interface [Feature]Type {
  id: string;
  institute_id: string;
  name: string;
  // Add your domain-specific fields
  created_at: string;
  updated_at: string;
}

export interface [Feature]ListResponse {
  data: [Feature]Type[];
  total: number;
  page: number;
  limit: number;
}

export interface [Feature]State {
  items: [Feature]Type[];
  total: number;
  page: number;
  limit: number;

  selected[Feature]: [Feature]Type | null;

  listLoading: boolean;
  detailLoading: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;

  listError: string | null;
  detailError: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;

  currentFilters: Record<string, any>;
}

export const initial[Feature]State: [Feature]State = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,

  selected[Feature]: null,

  listLoading: false,
  detailLoading: false,
  creating: false,
  updating: false,
  deleting: false,

  listError: null,
  detailError: null,
  createError: null,
  updateError: null,
  deleteError: null,

  currentFilters: {},
};
```

---

## Step 3: Slice with Thunks (`[feature]Slice.ts`)

**Path:** `src/features/[feature]/[feature]Slice.ts`

```typescript
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  [feature]Api,
  Fetch[Feature]Params,
  Create[Feature]Payload,
  Update[Feature]Payload,
} from './[feature]Api';
import {
  [Feature]Type,
  [Feature]State,
  initial[Feature]State,
  [Feature]ListResponse,
} from './[feature]Types';

/**
 * ASYNC THUNKS
 */

export const fetch[Features] = createAsyncThunk<
  [Feature]ListResponse,
  Fetch[Feature]Params,
  { rejectValue: string }
>(
  '[feature]/fetch[Features]',
  async (params, { rejectWithValue }) => {
    try {
      return await [feature]Api.fetch[Features](params);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch [features]'
      );
    }
  }
);

export const fetch[Feature]ById = createAsyncThunk<
  [Feature]Type,
  string,
  { rejectValue: string }
>(
  '[feature]/fetch[Feature]ById',
  async (id, { rejectWithValue }) => {
    try {
      return await [feature]Api.fetch[Feature]ById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch [feature]'
      );
    }
  }
);

export const create[Feature] = createAsyncThunk<
  [Feature]Type,
  Create[Feature]Payload,
  { rejectValue: string }
>(
  '[feature]/create[Feature]',
  async (payload, { rejectWithValue }) => {
    try {
      return await [feature]Api.create[Feature](payload);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create [feature]'
      );
    }
  }
);

export const update[Feature] = createAsyncThunk<
  [Feature]Type,
  Update[Feature]Payload,
  { rejectValue: string }
>(
  '[feature]/update[Feature]',
  async (payload, { rejectWithValue }) => {
    try {
      return await [feature]Api.update[Feature](payload);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update [feature]'
      );
    }
  }
);

export const delete[Feature] = createAsyncThunk<
  void,
  string,
  { rejectValue: string }
>(
  '[feature]/delete[Feature]',
  async (id, { rejectWithValue }) => {
    try {
      await [feature]Api.delete[Feature](id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete [feature]'
      );
    }
  }
);

/**
 * SLICE
 */

const [feature]Slice = createSlice({
  name: '[feature]',
  initialState: initial[Feature]State,

  reducers: {
    clearErrors: (state) => {
      state.listError = null;
      state.detailError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },

    setFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.currentFilters = action.payload;
      state.page = 1;
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },

    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload;
      state.page = 1;
    },

    reset[Feature]State: () => initial[Feature]State,

    add[Feature]Optimistic: (state, action: PayloadAction<[Feature]Type>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },

    update[Feature]Optimistic: (state, action: PayloadAction<[Feature]Type>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },

    remove[Feature]Optimistic: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total -= 1;
    },
  },

  extraReducers: (builder) => {
    // Fetch list
    builder
      .addCase(fetch[Features].pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetch[Features].fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetch[Features].rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || 'Failed to fetch [features]';
      });

    // Fetch detail
    builder
      .addCase(fetch[Feature]ById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetch[Feature]ById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selected[Feature] = action.payload;
      })
      .addCase(fetch[Feature]ById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || 'Failed to fetch [feature]';
      });

    // Create
    builder
      .addCase(create[Feature].pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(create[Feature].fulfilled, (state, action) => {
        state.creating = false;
        state.items.unshift(action.payload);
        state.total += 1;
      })
      .addCase(create[Feature].rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || 'Failed to create [feature]';
      });

    // Update
    builder
      .addCase(update[Feature].pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(update[Feature].fulfilled, (state, action) => {
        state.updating = false;
        const index = state.items.findIndex(
          item => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selected[Feature]?.id === action.payload.id) {
          state.selected[Feature] = action.payload;
        }
      })
      .addCase(update[Feature].rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || 'Failed to update [feature]';
      });

    // Delete
    builder
      .addCase(delete[Feature].pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(delete[Feature].fulfilled, (state) => {
        state.deleting = false;
      })
      .addCase(delete[Feature].rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || 'Failed to delete [feature]';
      });
  },
});

// Exports
export const {
  clearErrors,
  setFilters,
  setPage,
  setLimit,
  reset[Feature]State,
  add[Feature]Optimistic,
  update[Feature]Optimistic,
  remove[Feature]Optimistic,
} = [feature]Slice.actions;

export default [feature]Slice.reducer;
```

---

## Step 4: Hooks (`[feature]Hooks.ts`)

**Path:** `src/features/[feature]/[feature]Hooks.ts`

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store';
import {
  fetch[Features],
  fetch[Feature]ById,
  create[Feature],
  update[Feature],
  delete[Feature],
  setFilters,
  setPage,
  clearErrors,
  remove[Feature]Optimistic,
} from './[feature]Slice';
import type {
  Fetch[Feature]Params,
  Create[Feature]Payload,
  Update[Feature]Payload,
} from './[feature]Api';

export const use[Feature]List = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.[feature]);

  const load[Features] = (params: Fetch[Feature]Params) => {
    dispatch(fetch[Features](params));
  };

  return {
    [features]: state.items,
    total: state.total,
    page: state.page,
    limit: state.limit,
    loading: state.listLoading,
    error: state.listError,
    filters: state.currentFilters,
    load[Features],
    setFilters: (filters: any) => dispatch(setFilters(filters)),
    setPage: (page: number) => dispatch(setPage(page)),
  };
};

export const use[Feature]Detail = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.[feature]);

  const load[Feature] = (id: string) => {
    dispatch(fetch[Feature]ById(id));
  };

  return {
    [feature]: state.selected[Feature],
    loading: state.detailLoading,
    error: state.detailError,
    load[Feature],
  };
};

export const use[Feature]Mutations = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((state: RootState) => state.[feature]);

  const handleCreate[Feature] = (payload: Create[Feature]Payload) => {
    return dispatch(create[Feature](payload));
  };

  const handleUpdate[Feature] = (payload: Update[Feature]Payload) => {
    return dispatch(update[Feature](payload));
  };

  const handleDelete[Feature] = (id: string) => {
    dispatch(remove[Feature]Optimistic(id));
    return dispatch(delete[Feature](id));
  };

  return {
    creating: state.creating,
    updating: state.updating,
    deleting: state.deleting,
    createError: state.createError,
    updateError: state.updateError,
    deleteError: state.deleteError,
    create[Feature]: handleCreate[Feature],
    update[Feature]: handleUpdate[Feature],
    delete[Feature]: handleDelete[Feature],
    clearErrors: () => dispatch(clearErrors()),
  };
};

export const use[Feature] = () => {
  const list = use[Feature]List();
  const detail = use[Feature]Detail();
  const mutations = use[Feature]Mutations();

  return { ...list, ...detail, ...mutations };
};
```

---

## Step 5: Selectors (`[feature]Selectors.ts`)

**Path:** `src/features/[feature]/[feature]Selectors.ts`

```typescript
import { RootState } from '@/lib/store';

export const select[Feature]State = (state: RootState) => state.[feature];

export const select[Feature]List = (state: RootState) => state.[feature].items;

export const select[Feature]Total = (state: RootState) => state.[feature].total;

export const select[Feature]Page = (state: RootState) => state.[feature].page;

export const select[Feature]Filters = (state: RootState) => state.[feature].currentFilters;

export const selectSelected[Feature] = (state: RootState) => state.[feature].selected[Feature];

export const select[Feature]Loading = (state: RootState) => ({
  list: state.[feature].listLoading,
  detail: state.[feature].detailLoading,
  creating: state.[feature].creating,
  updating: state.[feature].updating,
  deleting: state.[feature].deleting,
});

export const select[Feature]Errors = (state: RootState) => ({
  list: state.[feature].listError,
  detail: state.[feature].detailError,
  create: state.[feature].createError,
  update: state.[feature].updateError,
  delete: state.[feature].deleteError,
});

export const selectIs[Feature]ListLoading = (state: RootState) =>
  state.[feature].listLoading;

export const selectIs[Feature]DetailLoading = (state: RootState) =>
  state.[feature].detailLoading;

export const select[Feature]ListError = (state: RootState) => state.[feature].listError;
```

---

## Step 6: Barrel Export (`index.ts`)

**Path:** `src/features/[feature]/index.ts`

```typescript
export { [feature]Api } from './[feature]Api';
export type {
  Fetch[Feature]Params,
  Create[Feature]Payload,
  Update[Feature]Payload,
} from './[feature]Api';

export { initial[Feature]State } from './[feature]Types';
export type {
  [Feature]Type,
  [Feature]ListResponse,
  [Feature]State,
} from './[feature]Types';

export {
  default as [feature]Reducer,
  fetch[Features],
  fetch[Feature]ById,
  create[Feature],
  update[Feature],
  delete[Feature],
  setFilters,
  setPage,
  setLimit,
  clearErrors,
  reset[Feature]State,
  add[Feature]Optimistic,
  update[Feature]Optimistic,
  remove[Feature]Optimistic,
} from './[feature]Slice';

export {
  use[Feature],
  use[Feature]List,
  use[Feature]Detail,
  use[Feature]Mutations,
} from './[feature]Hooks';

export {
  select[Feature]State,
  select[Feature]List,
  select[Feature]Total,
  select[Feature]Page,
  select[Feature]Filters,
  selectSelected[Feature],
  select[Feature]Loading,
  select[Feature]Errors,
  selectIs[Feature]ListLoading,
  selectIs[Feature]DetailLoading,
  select[Feature]ListError,
} from './[feature]Selectors';
```

---

## Step 7: Register in Store

**Path:** `src/lib/store.ts`

Add these lines:

```typescript
import [feature]Reducer from '@/features/[feature]/[feature]Slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    // ... existing features ...
    [feature]: [feature]Reducer,  // ADD THIS LINE
  },
});
```

---

## Implementation Checklist

- [ ] Create `[feature]/[feature]Api.ts` with API calls
- [ ] Create `[feature]/[feature]Types.ts` with interfaces
- [ ] Create `[feature]/[feature]Slice.ts` with thunks & reducer
- [ ] Create `[feature]/[feature]Hooks.ts` with custom hooks
- [ ] Create `[feature]/[feature]Selectors.ts` with selectors
- [ ] Update `[feature]/index.ts` with barrel exports
- [ ] Add reducer to `src/lib/store.ts`
- [ ] Test with a component using `use[Feature]()` hook

---

## Usage Example in Components

```tsx
'use client';

import { use[Feature] } from '@/features/[feature]';
import { useEffect } from 'react';

export function [Feature]Dashboard() {
  const {
    [features],
    total,
    loading,
    error,
    load[Features],
    creating,
    create[Feature],
  } = use[Feature]();

  useEffect(() => {
    load[Features]({ instituteId: 'inst-123' });
  }, []);

  return (
    <div>
      <h1>[Feature] Management</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <ul>
          {[features].map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## Time Estimate

- **API + Types**: 10-15 minutes
- **Slice with Thunks**: 20-25 minutes
- **Hooks + Selectors**: 10-15 minutes
- **Integration in Component**: 10-15 minutes

**Total: 50-70 minutes per feature**

---

## Features Remaining

Priority 1 (High Impact):
- [ ] Teacher
- [ ] Fee
- [ ] Lead

Priority 2 (Medium Impact):
- [ ] Team
- [ ] Billing
- [ ] Subscription

Priority 3 (Complex):
- [ ] Institute
- [ ] Attendance
- [ ] WhatsApp
- [ ] Integration
- [ ] Notes
- [ ] Dashboard

Priority 4 (Lower Impact):
- [ ] Profile
- [ ] Business

**Total Remaining: 16 features**
**Total Time: ~12-14 hours** (1-2 weeks at 2 hours/day)
