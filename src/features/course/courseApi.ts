import api from '@/lib/axios';

/**
 * Course API Layer
 * Same pattern as Student + Batch
 */

export interface FetchCoursesParams {
    instituteId: string;
    batchId?: string;
    page?: number;
    limit?: number;
    search?: string;
}

export interface CreateCoursePayload {
    name: string;
    instituteId: string;
    batchId?: string;
    description?: string;
}

export interface UpdateCoursePayload {
    id: string;
    name?: string;
    batchId?: string;
    description?: string;
}

export const courseApi = {
    fetchCourses: async (params: FetchCoursesParams) => {
        const response = await api.get('/v1/courses', { params });
        return response.data;
    },

    fetchCourseById: async (id: string) => {
        const response = await api.get(`/v1/courses/${id}`);
        return response.data;
    },

    createCourse: async (payload: CreateCoursePayload) => {
        const response = await api.post('/v1/courses', payload);
        return response.data;
    },

    updateCourse: async (payload: UpdateCoursePayload) => {
        const response = await api.patch(`/v1/courses/${payload.id}`, payload);
        return response.data;
    },

    deleteCourse: async (id: string) => {
        const response = await api.delete(`/v1/courses/${id}`);
        return response.data;
    },
};
