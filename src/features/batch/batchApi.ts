import api from '@/lib/axios';

/**
 * TEMPLATE: Copy this for new features like: Batch, Course, Teacher, Fee, etc.
 * 
 * Steps:
 * 1. Replace "Batch" with your feature name
 * 2. Update the endpoints (/v1/batches)
 * 3. Update the interface names and payloads
 * 4. Copy the exact same thunklogic to batchSlice.ts
 */

export interface FetchBatchesParams {
    instituteId: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface CreateBatchPayload {
    name: string;
    instituteId: string;
    startDate?: string;
    endDate?: string;
}

export interface UpdateBatchPayload {
    id: string;
    name?: string;
    startDate?: string;
    endDate?: string;
}

export const batchApi = {
    fetchBatches: async (params: FetchBatchesParams) => {
        const response = await api.get('/v1/batches', { params });
        return response.data;
    },

    fetchBatchById: async (id: string) => {
        const response = await api.get(`/v1/batches/${id}`);
        return response.data;
    },

    createBatch: async (payload: CreateBatchPayload) => {
        const response = await api.post('/v1/batches', payload);
        return response.data;
    },

    updateBatch: async (payload: UpdateBatchPayload) => {
        const response = await api.patch(`/v1/batches/${payload.id}`, payload);
        return response.data;
    },

    deleteBatch: async (id: string) => {
        const response = await api.delete(`/v1/batches/${id}`);
        return response.data;
    },
};
