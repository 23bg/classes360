import api from '@/lib/axios';

/**
 * Student API Layer
 * All API calls are isolated here
 */

export interface FetchStudentsParams {
    instituteId: string;
    page?: number;
    limit?: number;
    search?: string;
    batchId?: string;
    status?: string;
}

export interface CreateStudentPayload {
    name: string;
    email?: string;
    phone?: string;
    batchId?: string;
    instituteId: string;
}

export interface UpdateStudentPayload {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    batchId?: string;
    status?: string;
}

export const studentApi = {
    /**
     * Fetch all students for an institute
     */
    fetchStudents: async (params: FetchStudentsParams) => {
        const response = await api.get('/v1/students', { params });
        return response.data;
    },

    /**
     * Fetch a single student by ID
     */
    fetchStudentById: async (id: string) => {
        const response = await api.get(`/v1/students/${id}`);
        return response.data;
    },

    /**
     * Create a new student
     */
    createStudent: async (payload: CreateStudentPayload) => {
        const response = await api.post('/v1/students', payload);
        return response.data;
    },

    /**
     * Update an existing student
     */
    updateStudent: async (payload: UpdateStudentPayload) => {
        const response = await api.patch(`/v1/students/${payload.id}`, payload);
        return response.data;
    },

    /**
     * Delete a student
     */
    deleteStudent: async (id: string) => {
        const response = await api.delete(`/v1/students/${id}`);
        return response.data;
    },

    /**
     * Bulk update students
     */
    bulkUpdateStudents: async (ids: string[], updateData: Record<string, any>) => {
        const response = await api.patch('/v1/students/bulk-update', { ids, ...updateData });
        return response.data;
    },
};
