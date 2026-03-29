import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { courseApi, FetchCoursesParams, CreateCoursePayload, UpdateCoursePayload } from './courseApi';
import { CourseType, CourseState, initialCourseState, CourseListResponse } from './courseTypes';

export const fetchCourses = createAsyncThunk<
    CourseListResponse,
    FetchCoursesParams,
    { rejectValue: string }
>(
    'course/fetchCourses',
    async (params, { rejectWithValue }) => {
        try {
            return await courseApi.fetchCourses(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch courses');
        }
    }
);

export const fetchCourseById = createAsyncThunk<
    CourseType,
    string,
    { rejectValue: string }
>(
    'course/fetchCourseById',
    async (id, { rejectWithValue }) => {
        try {
            return await courseApi.fetchCourseById(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch course');
        }
    }
);

export const createCourse = createAsyncThunk<
    CourseType,
    CreateCoursePayload,
    { rejectValue: string }
>(
    'course/createCourse',
    async (payload, { rejectWithValue }) => {
        try {
            return await courseApi.createCourse(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create course');
        }
    }
);

export const updateCourse = createAsyncThunk<
    CourseType,
    UpdateCoursePayload,
    { rejectValue: string }
>(
    'course/updateCourse',
    async (payload, { rejectWithValue }) => {
        try {
            return await courseApi.updateCourse(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update course');
        }
    }
);

export const deleteCourse = createAsyncThunk<
    void,
    string,
    { rejectValue: string }
>(
    'course/deleteCourse',
    async (id, { rejectWithValue }) => {
        try {
            await courseApi.deleteCourse(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete course');
        }
    }
);

const courseSlice = createSlice({
    name: 'course',
    initialState: initialCourseState,

    reducers: {
        clearErrors: (state) => {
            state.listError = null;
            state.detailError = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
        },

        setFilters: (state, action: PayloadAction<{ search?: string; batchId?: string }>) => {
            state.currentFilters = action.payload;
            state.page = 1;
        },

        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload;
        },

        resetCourseState: () => initialCourseState,

        removeCourseOptimistic: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(c => c.id !== action.payload);
            state.total -= 1;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchCourses.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.listLoading = false;
                state.items = action.payload.data;
                state.total = action.payload.total;
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload || 'Failed to fetch courses';
            });

        builder
            .addCase(fetchCourseById.pending, (state) => {
                state.detailLoading = true;
            })
            .addCase(fetchCourseById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedCourse = action.payload;
            })
            .addCase(fetchCourseById.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload || 'Failed to fetch course';
            });

        builder
            .addCase(createCourse.pending, (state) => {
                state.creating = true;
                state.createError = null;
            })
            .addCase(createCourse.fulfilled, (state, action) => {
                state.creating = false;
                state.items.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createCourse.rejected, (state, action) => {
                state.creating = false;
                state.createError = action.payload || 'Failed to create course';
            });

        builder
            .addCase(updateCourse.pending, (state) => {
                state.updating = true;
                state.updateError = null;
            })
            .addCase(updateCourse.fulfilled, (state, action) => {
                state.updating = false;
                const index = state.items.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateCourse.rejected, (state, action) => {
                state.updating = false;
                state.updateError = action.payload || 'Failed to update course';
            });

        builder
            .addCase(deleteCourse.pending, (state) => {
                state.deleting = true;
                state.deleteError = null;
            })
            .addCase(deleteCourse.fulfilled, (state) => {
                state.deleting = false;
            })
            .addCase(deleteCourse.rejected, (state, action) => {
                state.deleting = false;
                state.deleteError = action.payload || 'Failed to delete course';
            });
    },
});

export const { clearErrors, setFilters, setPage, resetCourseState, removeCourseOptimistic } =
    courseSlice.actions;

export default courseSlice.reducer;
