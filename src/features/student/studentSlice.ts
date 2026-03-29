import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { studentApi, FetchStudentsParams, CreateStudentPayload, UpdateStudentPayload } from './studentApi';
import { StudentType, StudentState, initialStudentState, StudentListResponse } from './studentTypes';

/**
 * ASYNC THUNKS
 */

/**
 * Fetch all students for an institute
 */
export const fetchStudents = createAsyncThunk<
    StudentListResponse,
    FetchStudentsParams,
    { rejectValue: string }
>(
    'student/fetchStudents',
    async (params, { rejectWithValue }) => {
        try {
            return await studentApi.fetchStudents(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch students');
        }
    }
);

/**
 * Fetch a single student by ID
 */
export const fetchStudentById = createAsyncThunk<
    StudentType,
    string,
    { rejectValue: string }
>(
    'student/fetchStudentById',
    async (id, { rejectWithValue }) => {
        try {
            return await studentApi.fetchStudentById(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch student');
        }
    }
);

/**
 * Create a new student
 */
export const createStudent = createAsyncThunk<
    StudentType,
    CreateStudentPayload,
    { rejectValue: string }
>(
    'student/createStudent',
    async (payload, { rejectWithValue }) => {
        try {
            return await studentApi.createStudent(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create student');
        }
    }
);

/**
 * Update an existing student
 */
export const updateStudent = createAsyncThunk<
    StudentType,
    UpdateStudentPayload,
    { rejectValue: string }
>(
    'student/updateStudent',
    async (payload, { rejectWithValue }) => {
        try {
            return await studentApi.updateStudent(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update student');
        }
    }
);

/**
 * Delete a student
 */
export const deleteStudent = createAsyncThunk<
    void,
    string,
    { rejectValue: string }
>(
    'student/deleteStudent',
    async (id, { rejectWithValue }) => {
        try {
            await studentApi.deleteStudent(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete student');
        }
    }
);

/**
 * SLICE
 */

const studentSlice = createSlice({
    name: 'student',
    initialState: initialStudentState,

    reducers: {
        /**
         * Clear errors
         */
        clearErrors: (state) => {
            state.listError = null;
            state.detailError = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
        },

        /**
         * Set filters
         */
        setFilters: (state, action: PayloadAction<{ search?: string; batchId?: string; status?: string }>) => {
            state.currentFilters = action.payload;
            state.page = 1; // Reset to first page on filter change
        },

        /**
         * Set page
         */
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },

        /**
         * Set limit
         */
        setLimit: (state, action: PayloadAction<number>) => {
            state.limit = action.payload;
            state.page = 1; // Reset to first page on limit change
        },

        /**
         * Reset state
         */
        resetStudentState: () => initialStudentState,

        /**
         * Add student to list (optimistic update)
         */
        addStudentOptimistic: (state, action: PayloadAction<StudentType>) => {
            state.items.unshift(action.payload);
            state.total += 1;
        },

        /**
         * Update student in list (optimistic update)
         */
        updateStudentOptimistic: (state, action: PayloadAction<StudentType>) => {
            const index = state.items.findIndex(s => s.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },

        /**
         * Remove student from list (optimistic update)
         */
        removeStudentOptimistic: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(s => s.id !== action.payload);
            state.total -= 1;
        },
    },

    extraReducers: (builder) => {
        // Fetch students
        builder
            .addCase(fetchStudents.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchStudents.fulfilled, (state, action) => {
                state.listLoading = false;
                state.items = action.payload.data;
                state.total = action.payload.total;
                state.page = action.payload.page;
                state.limit = action.payload.limit;
            })
            .addCase(fetchStudents.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload || 'Failed to fetch students';
            });

        // Fetch single student
        builder
            .addCase(fetchStudentById.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchStudentById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedStudent = action.payload;
            })
            .addCase(fetchStudentById.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload || 'Failed to fetch student';
            });

        // Create student
        builder
            .addCase(createStudent.pending, (state) => {
                state.creating = true;
                state.createError = null;
            })
            .addCase(createStudent.fulfilled, (state, action) => {
                state.creating = false;
                state.items.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createStudent.rejected, (state, action) => {
                state.creating = false;
                state.createError = action.payload || 'Failed to create student';
            });

        // Update student
        builder
            .addCase(updateStudent.pending, (state) => {
                state.updating = true;
                state.updateError = null;
            })
            .addCase(updateStudent.fulfilled, (state, action) => {
                state.updating = false;
                const index = state.items.findIndex(s => s.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedStudent?.id === action.payload.id) {
                    state.selectedStudent = action.payload;
                }
            })
            .addCase(updateStudent.rejected, (state, action) => {
                state.updating = false;
                state.updateError = action.payload || 'Failed to update student';
            });

        // Delete student
        builder
            .addCase(deleteStudent.pending, (state) => {
                state.deleting = true;
                state.deleteError = null;
            })
            .addCase(deleteStudent.fulfilled, (state, action) => {
                state.deleting = false;
                // Note: We need the ID from thunk payload meta
                // This is handled in component with removeStudentOptimistic
            })
            .addCase(deleteStudent.rejected, (state, action) => {
                state.deleting = false;
                state.deleteError = action.payload || 'Failed to delete student';
            });
    },
});

/**
 * EXPORTS
 */

export const {
    clearErrors,
    setFilters,
    setPage,
    setLimit,
    resetStudentState,
    addStudentOptimistic,
    updateStudentOptimistic,
    removeStudentOptimistic,
} = studentSlice.actions;

export default studentSlice.reducer;
