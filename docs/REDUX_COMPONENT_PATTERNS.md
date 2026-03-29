# Redux Toolkit Component Integration Patterns

## Table of Contents
1. [Basic List Display](#basic-list-display)
2. [Create Form Pattern](#create-form-pattern)
3. [Update Form Pattern](#update-form-pattern)
4. [Delete with Confirmation](#delete-with-confirmation)
5. [Pagination & Filtering](#pagination--filtering)
6. [Error Handling](#error-handling)
7. [Loading States](#loading-states)
8. [Optimistic Updates](#optimistic-updates)

---

## Basic List Display

### Simple Read-Only List

```tsx
'use client';

import { useStudent } from '@/features/student';

export function StudentListView() {
  const { students, loading, error, loadStudents } = useStudent();

  useEffect(() => {
    loadStudents({ instituteId: 'inst-123' });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Students</h1>
      <ul>
        {students.map(student => (
          <li key={student.id}>{student.name} ({student.email})</li>
        ))}
      </ul>
    </div>
  );
}
```

### Using Selectors Instead of Hooks

```tsx
import { useSelector } from 'react-redux';
import { selectStudentList, selectIsStudentListLoading } from '@/features/student';

export function StudentListView() {
  const students = useSelector(selectStudentList);
  const loading = useSelector(selectIsStudentListLoading);

  // ... (same component logic)
}
```

---

## Create Form Pattern

### Create with Inline Validation

```tsx
'use client';

import { useStudentMutations } from '@/features/student';
import { useForm } from 'react-hook-form';

interface CreateStudentForm {
  name: string;
  email?: string;
  phone?: string;
  batchId?: string;
}

export function CreateStudentForm({ instituteId, onSuccess }: Props) {
  const { createStudent, creating, createError } = useStudentMutations();
  const { register, handleSubmit, formState: { errors } } = useForm<CreateStudentForm>();

  const onSubmit = async (data: CreateStudentForm) => {
    const resultAction = await dispatch(createStudent({
      ...data,
      instituteId,
    }));

    if (createStudent.fulfilled.match(resultAction)) {
      toast.success('Student created successfully!');
      onSuccess?.(resultAction.payload);
    }
  };

  return (
    <form formHandleSubmit={handleSubmit(onSubmit)}>
      <input
        {...register('name', { required: 'Name is required' })}
        placeholder="Student Name"
      />
      {errors.name && <span>{errors.name.message}</span>}

      <input
        {...register('email')}
        placeholder="Email"
        type="email"
      />

      <button type="submit" disabled={creating}>
        {creating ? 'Creating...' : 'Create Student'}
      </button>

      {createError && <div className="error">{createError}</div>}
    </form>
  );
}
```

---

## Update Form Pattern

### Edit Existing Item

```tsx
'use client';

import { useStudentDetail, useStudentMutations } from '@/features/student';
import { useEffect } from 'react';

export function EditStudentForm({ studentId }: { studentId: string }) {
  const { student, loading: detailLoading, loadStudent } = useStudentDetail();
  const { updateStudent, updating, updateError, clearErrors } = useStudentMutations();

  // Load student details on mount
  useEffect(() => {
    loadStudent(studentId);
    return () => clearErrors();
  }, [studentId]);

  const handleSubmit = async (formData: any) => {
    const resultAction = await updateStudent({
      id: studentId,
      ...formData,
    });

    if (updateStudent.fulfilled.match(resultAction)) {
      toast.success('Student updated successfully!');
    }
  };

  if (detailLoading) return <div>Loading student...</div>;
  if (!student) return <div>Student not found</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        defaultValue={student.name}
        placeholder="Name"
        required
      />

      <input
        defaultValue={student.email || ''}
        placeholder="Email"
        type="email"
      />

      <button disabled={updating}>
        {updating ? 'Saving...' : 'Save Changes'}
      </button>

      {updateError && <div className="error">{updateError}</div>}
    </form>
  );
}
```

---

## Delete with Confirmation

### Safe Delete with Confirmation Dialog

```tsx
'use client';

import { useStudentMutations } from '@/features/student';
import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';

export function StudentRow({ student }: { student: StudentType }) {
  const { deleteStudent, deleting, deleteError } = useStudentMutations();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    const resultAction = await deleteStudent(student.id);

    if (deleteStudent.fulfilled.match(resultAction)) {
      toast.success('Student deleted successfully');
      setShowConfirm(false);
    }
  };

  return (
    <>
      <tr>
        <td>{student.name}</td>
        <td>{student.email}</td>
        <td>
          <button 
            onClick={() => setShowConfirm(true)}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </td>
      </tr>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Student?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete {student.name}.
          </AlertDialogDescription>
          {deleteError && <div className="error">{deleteError}</div>}
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="destructive">
            Delete
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

---

## Pagination & Filtering

### Paginated List with Filters

```tsx
'use client';

import { useStudentList } from '@/features/student';
import { useCallback, useEffect } from 'react';

export function PaginatedStudentList() {
  const {
    students, total, page, limit, loading, error,
    filters, currentFilters,
    loadStudents, setFilters, setPage, setLimit,
  } = useStudentList();

  const instituteId = 'inst-123'; // from context/props

  // Load data when filters/page changes
  useEffect(() => {
    loadStudents({
      instituteId,
      page,
      limit,
      ...filters,
    });
  }, [page, limit, filters]);

  const handleSearch = useCallback((query: string) => {
    setFilters({ ...filters, search: query });
  }, [filters]);

  const handleBatchFilter = useCallback((batchId: string) => {
    setFilters({ ...filters, batchId, search: '' });
  }, [filters]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Filters */}
      <input
        placeholder="Search by name..."
        onChange={(e) => handleSearch(e.target.value)}
        value={filters.search || ''}
      />

      <select onChange={(e) => handleBatchFilter(e.target.value)}>
        <option value="">All Batches</option>
        {/* ... batch options ... */}
      </select>

      {/* Table */}
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <StudentRow key={student.id} student={student} />
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {totalPages} (Total: {total})
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>

            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
}
```

---

## Error Handling

### Multi-Error Handling

```tsx
'use client';

import { useStudentMutations } from '@/features/student';

export function StudentFormWithErrors() {
  const {
    createError, updateError, deleteError,
    creating, updating, deleting,
    createStudent, updateStudent, deleteStudent,
    clearErrors,
  } = useStudentMutations();

  const allErrors = {
    create: createError,
    update: updateError,
    delete: deleteError,
  };

  const activeError = Object.entries(allErrors).find(([_, error]) => error)?.[1];

  return (
    <div>
      {/* Global error display */}
      {activeError && (
        <div className="alert alert-error">
          <button onClick={clearErrors}>✕</button>
          <strong>Error:</strong> {activeError}
        </div>
      )}

      {/* Form sections */}
      <section>
        <h3>Create New Student</h3>
        {/* ... form ... */}
      </section>

      <section>
        <h3>Update Student</h3>
        {/* ... form ... */}
      </section>
    </div>
  );
}
```

---

## Loading States

### Progressive Loading UI

```tsx
'use client';

import { useStudent } from '@/features/student';
import { Skeleton } from '@/components/ui/skeleton';

export function StudentDashboard() {
  const { students, loading, creating, updating, deleting } = useStudent();

  return (
    <div>
      <div className="header">
        <h1>Students</h1>
        <button disabled={loading || creating}>
          {creating ? 'Adding...' : 'Add Student'}
        </button>
      </div>

      <div className="list">
        {loading ? (
          // Show skeletons while loading
          Array(5).fill(0).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-12 w-full mb-2" />
            </div>
          ))
        ) : students.length === 0 ? (
          <div>No students found</div>
        ) : (
          students.map(student => (
            <StudentCard
              key={student.id}
              student={student}
              isUpdating={updating}
              isDeleting={deleting}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

---

## Optimistic Updates

### Optimistic Add/Update/Delete

```tsx
'use client';

import { useStudentMutations, addStudentOptimistic, updateStudentOptimistic } from '@/features/student';
import { useDispatch } from 'react-redux';

export function OptimisticStudentForm() {
  const dispatch = useDispatch();
  const { createStudent, updateStudent, updating } = useStudentMutations();

  const handleCreateOptimistic = async (formData: CreateStudentPayload) => {
    // Optimistic update: assume success and update UI immediately
    const optimisticStudent: StudentType = {
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...formData,
    };

    dispatch(addStudentOptimistic(optimisticStudent));

    // Perform actual creation
    const resultAction = await createStudent(formData);

    // If failed, undo (would need a revert action for this)
    if (createStudent.rejected.match(resultAction)) {
      // TODO: Remove optimistic student from list
      toast.error('Failed to create student. Rolled back.');
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleCreateOptimistic({ /* form data */ });
    }}>
      {/* ... form fields ... */}
      <button disabled={updating}>
        {updating ? 'Creating...' : 'Create'}
      </button>
    </form>
  );
}
```

---

## Summary Table

| Pattern | Use Case | Hook |
|---------|----------|------|
| Basic List | Read-only display | `useStudentList()` |
| Create Form | Add new items | `useStudentMutations()` |
| Edit Form | Update existing | `useStudentDetail()` + `useStudentMutations()` |
| Delete | Remove items | `useStudentMutations()` |
| Pagination | Large lists | `useStudentList()` with `setPage()` |
| Filtering | Search/filter | `useStudentList()` with `setFilters()` |
| Error UI | Handle failures | All hooks provide error states |
| Loading UI | Async states | All hooks provide loading states |

---

## Full Example Component

```tsx
'use client';

import { useStudent } from '@/features/student';
import { useEffect, useState } from 'react';

export default function StudentManagementPage() {
  const { students, loading, error, loadStudents, creating, createStudent } = useStudent();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadStudents({ instituteId: 'inst-123' });
  }, []);

  const handleCreate = async (data: any) => {
    const result = await createStudent({ ...data, instituteId: 'inst-123' });
    if (createStudent.fulfilled.match(result)) {
      setShowForm(false);
      toast.success('Student created!');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          {showForm ? 'Cancel' : 'Add Student'}
        </button>
      </div>

      {showForm && (
        <CreateStudentForm
          instituteId="inst-123"
          onSuccess={() => setShowForm(false)}
        />
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className="grid gap-4">
          {students.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Testing Patterns

```tsx
import { createAsyncThunk } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { mockStore } from '@/test/mocks';

describe('StudentListView', () => {
  it('displays loading state', () => {
    const store = mockStore({
      student: { listLoading: true, items: [] },
    });

    render(
      <Provider store={store}>
        <StudentListView />
      </Provider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays students', () => {
    const store = mockStore({
      student: {
        listLoading: false,
        items: [{ id: '1', name: 'John', email: 'john@example.com' }],
      },
    });

    render(
      <Provider store={store}>
        <StudentListView />
      </Provider>
    );

    expect(screen.getByText('John')).toBeInTheDocument();
  });
});
```

---

For more examples, see the Student feature implementation in `src/features/student/`.
