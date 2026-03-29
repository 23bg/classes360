import { RootState } from '@/store';

/**
 * Student Selectors
 * Memoized selectors for better performance
 */

export const selectStudentState = (state: RootState) => state.student;

export const selectStudentList = (state: RootState) => state.student.items;

export const selectStudentTotal = (state: RootState) => state.student.total;

export const selectStudentPage = (state: RootState) => state.student.page;

export const selectStudentLimit = (state: RootState) => state.student.limit;

export const selectStudentFilters = (state: RootState) => state.student.currentFilters;

export const selectSelectedStudent = (state: RootState) => state.student.selectedStudent;

export const selectStudentByIdFactory = (id: string) => (state: RootState) => {
    return state.student.items.find(s => s.id === id);
};

export const selectStudentLoading = (state: RootState) => ({
    list: state.student.listLoading,
    detail: state.student.detailLoading,
    creating: state.student.creating,
    updating: state.student.updating,
    deleting: state.student.deleting,
});

export const selectStudentErrors = (state: RootState) => ({
    list: state.student.listError,
    detail: state.student.detailError,
    create: state.student.createError,
    update: state.student.updateError,
    delete: state.student.deleteError,
});

export const selectStudentsByBatch = (batchId: string) => (state: RootState) => {
    return state.student.items.filter(s => s.batch_id === batchId);
};

export const selectStudentsByStatus = (status: string) => (state: RootState) => {
    return state.student.items.filter(s => s.status === status);
};

export const selectStudentCount = (state: RootState) => state.student.items.length;

export const selectIsStudentListLoading = (state: RootState) => state.student.listLoading;

export const selectIsStudentDetailLoading = (state: RootState) => state.student.detailLoading;

export const selectStudentListError = (state: RootState) => state.student.listError;
