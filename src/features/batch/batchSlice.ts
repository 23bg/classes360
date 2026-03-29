import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { batchApi, FetchBatchesParams, CreateBatchPayload, UpdateBatchPayload } from './batchApi';
import { BatchType, BatchState, initialBatchState, BatchListResponse } from './batchTypes';

/**
 * ASYNC THUNKS
 * Copy from studentSlice.ts - same pattern applies
 */

export const fetchBatches = createAsyncThunk<
    BatchListResponse,
    FetchBatchesParams,
    { rejectValue: string }
>(
    'batch/fetchBatches',
    async (params, { rejectWithValue }) => {
        try {
            return await batchApi.fetchBatches(params);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch batches');
        }
    }
);

export const fetchBatchById = createAsyncThunk<
    BatchType,
    string,
    { rejectValue: string }
>(
    'batch/fetchBatchById',
    async (id, { rejectWithValue }) => {
        try {
            return await batchApi.fetchBatchById(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch batch');
        }
    }
);

export const createBatch = createAsyncThunk<
    BatchType,
    CreateBatchPayload,
    { rejectValue: string }
>(
    'batch/createBatch',
    async (payload, { rejectWithValue }) => {
        try {
            return await batchApi.createBatch(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to create batch');
        }
    }
);

export const updateBatch = createAsyncThunk<
    BatchType,
    UpdateBatchPayload,
    { rejectValue: string }
>(
    'batch/updateBatch',
    async (payload, { rejectWithValue }) => {
        try {
            return await batchApi.updateBatch(payload);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update batch');
        }
    }
);

export const deleteBatch = createAsyncThunk<
    void,
    string,
    { rejectValue: string }
>(
    'batch/deleteBatch',
    async (id, { rejectWithValue }) => {
        try {
            await batchApi.deleteBatch(id);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete batch');
        }
    }
);

/**
 * SLICE
 */

const batchSlice = createSlice({
    name: 'batch',
    initialState: initialBatchState,

    reducers: {
        clearErrors: (state) => {
            state.listError = null;
            state.detailError = null;
            state.createError = null;
            state.updateError = null;
            state.deleteError = null;
        },

        setFilters: (state, action: PayloadAction<{ search?: string }>) => {
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

        resetBatchState: () => initialBatchState,

        addBatchOptimistic: (state, action: PayloadAction<BatchType>) => {
            state.items.unshift(action.payload);
            state.total += 1;
        },

        updateBatchOptimistic: (state, action: PayloadAction<BatchType>) => {
            const index = state.items.findIndex(b => b.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },

        removeBatchOptimistic: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(b => b.id !== action.payload);
            state.total -= 1;
        },
    },

    extraReducers: (builder) => {
        // Fetch batches
        builder
            .addCase(fetchBatches.pending, (state) => {
                state.listLoading = true;
                state.listError = null;
            })
            .addCase(fetchBatches.fulfilled, (state, action) => {
                state.listLoading = false;
                state.items = action.payload.data;
                state.total = action.payload.total;
            })
            .addCase(fetchBatches.rejected, (state, action) => {
                state.listLoading = false;
                state.listError = action.payload || 'Failed to fetch batches';
            });

        // Fetch single batch
        builder
            .addCase(fetchBatchById.pending, (state) => {
                state.detailLoading = true;
                state.detailError = null;
            })
            .addCase(fetchBatchById.fulfilled, (state, action) => {
                state.detailLoading = false;
                state.selectedBatch = action.payload;
            })
            .addCase(fetchBatchById.rejected, (state, action) => {
                state.detailLoading = false;
                state.detailError = action.payload || 'Failed to fetch batch';
            });

        // Create batch
        builder
            .addCase(createBatch.pending, (state) => {
                state.creating = true;
                state.createError = null;
            })
            .addCase(createBatch.fulfilled, (state, action) => {
                state.creating = false;
                state.items.unshift(action.payload);
                state.total += 1;
            })
            .addCase(createBatch.rejected, (state, action) => {
                state.creating = false;
                state.createError = action.payload || 'Failed to create batch';
            });

        // Update batch
        builder
            .addCase(updateBatch.pending, (state) => {
                state.updating = true;
                state.updateError = null;
            })
            .addCase(updateBatch.fulfilled, (state, action) => {
                state.updating = false;
                const index = state.items.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
                if (state.selectedBatch?.id === action.payload.id) {
                    state.selectedBatch = action.payload;
                }
            })
            .addCase(updateBatch.rejected, (state, action) => {
                state.updating = false;
                state.updateError = action.payload || 'Failed to update batch';
            });

        // Delete batch
        builder
            .addCase(deleteBatch.pending, (state) => {
                state.deleting = true;
                state.deleteError = null;
            })
            .addCase(deleteBatch.fulfilled, (state) => {
                state.deleting = false;
            })
            .addCase(deleteBatch.rejected, (state, action) => {
                state.deleting = false;
                state.deleteError = action.payload || 'Failed to delete batch';
            });
    },
});

export const {
    clearErrors,
    setFilters,
    setPage,
    setLimit,
    resetBatchState,
    addBatchOptimistic,
    updateBatchOptimistic,
    removeBatchOptimistic,
} = batchSlice.actions;

export default batchSlice.reducer;
