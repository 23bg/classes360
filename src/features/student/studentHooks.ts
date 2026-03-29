import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    setFilters,
    setPage,
    setLimit,
    clearErrors,
    removeStudentOptimistic,
} from './studentSlice';
import type { FetchStudentsParams, CreateStudentPayload, UpdateStudentPayload } from './studentApi';

/**
 * useStudentList
 * Hook to fetch and manage list of students
 */
export const useStudentList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.student);

    const loadStudents = (params: FetchStudentsParams) => {
        dispatch(fetchStudents(params));
    };

    const handleSetFilters = (filters: { search?: string; batchId?: string; status?: string }) => {
        dispatch(setFilters(filters));
    };

    const handleSetPage = (page: number) => {
        dispatch(setPage(page));
    };

    const handleSetLimit = (limit: number) => {
        dispatch(setLimit(limit));
    };

    return {
        students: state.items,
        total: state.total,
        page: state.page,
        limit: state.limit,
        loading: state.listLoading,
        error: state.listError,
        filters: state.currentFilters,
        loadStudents,
        setFilters: handleSetFilters,
        setPage: handleSetPage,
        setLimit: handleSetLimit,
    };
};

/**
 * useStudentDetail
 * Hook to fetch and manage single student details
 */
export const useStudentDetail = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.student);

    const loadStudent = (id: string) => {
        dispatch(fetchStudentById(id));
    };

    return {
        student: state.selectedStudent,
        loading: state.detailLoading,
        error: state.detailError,
        loadStudent,
    };
};

/**
 * useStudentMutations
 * Hook for create, update, delete operations
 */
export const useStudentMutations = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.student);

    const handleCreateStudent = (payload: CreateStudentPayload) => {
        return dispatch(createStudent(payload));
    };

    const handleUpdateStudent = (payload: UpdateStudentPayload) => {
        return dispatch(updateStudent(payload));
    };

    const handleDeleteStudent = (id: string) => {
        // Optimistic update - remove from list immediately
        dispatch(removeStudentOptimistic(id));
        return dispatch(deleteStudent(id));
    };

    return {
        creating: state.creating,
        updating: state.updating,
        deleting: state.deleting,
        createError: state.createError,
        updateError: state.updateError,
        deleteError: state.deleteError,
        createStudent: handleCreateStudent,
        updateStudent: handleUpdateStudent,
        deleteStudent: handleDeleteStudent,
        clearErrors: () => dispatch(clearErrors()),
    };
};

/**
 * useStudent
 * Combined hook for all student operations
 */
export const useStudent = () => {
    const list = useStudentList();
    const detail = useStudentDetail();
    const mutations = useStudentMutations();

    return {
        ...list,
        ...detail,
        ...mutations,
    };
};
