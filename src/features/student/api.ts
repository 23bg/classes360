import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type {
    StudentType,
    CreateStudentInput,
    UpdateStudentInput,
    StudentListResponse,
} from './types';

type AsyncMutationResult<TData, TVariables> = readonly [
    (payload: TVariables) => Promise<TData>,
    {
        isLoading: boolean;
        data?: TData;
        error: unknown;
        reset: () => void;
    },
];

const useAsyncMutation = <TData, TVariables>(
    execute: (payload: TVariables) => Promise<TData>,
): AsyncMutationResult<TData, TVariables> => {
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<TData | undefined>(undefined);
    const [error, setError] = useState<unknown>(null);

    const reset = useCallback(() => {
        setData(undefined);
        setError(null);
        setIsLoading(false);
    }, []);

    const mutate = useCallback(
        async (payload: TVariables) => {
            setIsLoading(true);
            setError(null);
            try {
                const result = await execute(payload);
                setData(result);
                return result;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setIsLoading(false);
            }
        },
        [execute],
    );

    return [mutate, { isLoading, data, error, reset }] as const;
};

/**
 * Get all students for an institute
 * @param instituteId - The institute ID to fetch students for
 * @param page - Pagination page (default: 1)
 * @param limit - Items per page (default: 20)
 */
export const useGetStudents = (
    instituteId?: string,
    page: number = 1,
    limit: number = 20
) => {
    const [data, setData] = useState<StudentListResponse | undefined>(undefined);
    const [error, setError] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async () => {
        if (!instituteId) return undefined;
        setIsLoading(true);
        setError(null);
        try {
            const result = await api
                .get(`/v1/students`, {
                    params: { page, limit },
                })
                .then(res => res.data as StudentListResponse);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [instituteId, limit, page]);

    useEffect(() => {
        if (!instituteId) return;
        void refetch();
    }, [instituteId, refetch]);

    return useMemo(
        () => ({ data, isLoading, error, refetch }),
        [data, error, isLoading, refetch],
    );
};

/**
 * Get a single student by ID
 */
export const useGetStudent = (studentId?: string) => {
    const [data, setData] = useState<StudentType | undefined>(undefined);
    const [error, setError] = useState<unknown>(null);
    const [isLoading, setIsLoading] = useState(false);

    const refetch = useCallback(async () => {
        if (!studentId) return undefined;
        setIsLoading(true);
        setError(null);
        try {
            const result = await api.get(`/v1/students/${studentId}`).then(res => res.data as StudentType);
            setData(result);
            return result;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [studentId]);

    useEffect(() => {
        if (!studentId) return;
        void refetch();
    }, [studentId, refetch]);

    return useMemo(
        () => ({ data, isLoading, error, refetch }),
        [data, error, isLoading, refetch],
    );
};

/**
 * Create a new student
 */
export const useCreateStudent = () =>
    useAsyncMutation<StudentType, CreateStudentInput>((data: CreateStudentInput) =>
        api.post(`/v1/students`, data).then(res => res.data),
    );

/**
 * Update an existing student
 */
export const useUpdateStudent = () =>
    useAsyncMutation<StudentType, { id: string; data: UpdateStudentInput }>(
        ({ id, data }) => api.patch(`/v1/students/${id}`, data).then(res => res.data),
    );

/**
 * Delete a student
 */
export const useDeleteStudent = () =>
    useAsyncMutation<void, string>((id: string) =>
        api.delete(`/v1/students/${id}`).then(res => res.data),
    );

/**
 * Bulk update students (multiple students in one request)
 */
export const useBulkUpdateStudents = () =>
    useAsyncMutation<void, { ids: string[]; data: UpdateStudentInput }>(
        ({ ids, data }) =>
            api
                .patch(`/v1/students/bulk-update`, {
                    ids,
                    ...data,
                })
                .then(res => res.data),
    );
