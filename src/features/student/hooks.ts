import { useState, useCallback } from 'react';
import { useGetStudents } from './api';
import type { StudentType } from './types';

/**
 * Custom hook for student pagination and filtering
 */
export const useStudentFilters = () => {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [search, setSearch] = useState('');
    const [batchId, setBatchId] = useState<string | undefined>();
    const [status, setStatus] = useState<string | undefined>();

    const handleSearch = useCallback((query: string) => {
        setSearch(query);
        setPage(1); // Reset to first page on search
    }, []);

    const handleBatchFilter = useCallback((id: string | undefined) => {
        setBatchId(id);
        setPage(1);
    }, []);

    const handleStatusFilter = useCallback((value: string | undefined) => {
        setStatus(value);
        setPage(1);
    }, []);

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    return {
        page,
        limit,
        search,
        batchId,
        status,
        setLimit,
        handleSearch,
        handleBatchFilter,
        handleStatusFilter,
        handlePageChange,
    };
};

/**
 * Combined hook: fetches students with filtering logic
 */
export const useStudentsWithFilters = (instituteId?: string) => {
    const {
        page,
        limit,
        search,
        batchId,
        status,
        ...filterControls
    } = useStudentFilters();

    const { data, isLoading, error } = useGetStudents(instituteId, page, limit);

    // Client-side filtering (if not handled by API)
    const filteredStudents = data?.data?.filter((student: StudentType) => {
        if (search && !student.name.toLowerCase().includes(search.toLowerCase())) {
            return false;
        }
        if (batchId && student.batch_id !== batchId) {
            return false;
        }
        if (status && student.status !== status) {
            return false;
        }
        return true;
    }) ?? [];

    return {
        students: filteredStudents,
        total: data?.total ?? 0,
        page,
        limit,
        isLoading,
        error,
        search,
        batchId,
        status,
        ...filterControls,
    };
};

/**
 * Hook for managing selected students
 */
export const useStudentSelection = () => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelection = useCallback((id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    }, [selectedIds]);

    const selectAll = useCallback((ids: string[]) => {
        setSelectedIds(new Set(ids));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    return {
        selectedIds: Array.from(selectedIds),
        toggleSelection,
        selectAll,
        clearSelection,
        isSelected: (id: string) => selectedIds.has(id),
        hasSelection: selectedIds.size > 0,
        selectionCount: selectedIds.size,
    };
};
