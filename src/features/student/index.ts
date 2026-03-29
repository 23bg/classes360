// API
export { studentApi } from './studentApi';
export type { FetchStudentsParams, CreateStudentPayload, UpdateStudentPayload } from './studentApi';

// Types
export { initialStudentState } from './studentTypes';
export type { StudentType, StudentListResponse, StudentState } from './studentTypes';

// Slice & Thunks
export {
    default as studentReducer,
    fetchStudents,
    fetchStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    setFilters,
    setPage,
    setLimit,
    clearErrors,
    resetStudentState,
    addStudentOptimistic,
    updateStudentOptimistic,
    removeStudentOptimistic,
} from './studentSlice';

// Hooks
export {
    useStudent,
    useStudentList,
    useStudentDetail,
    useStudentMutations,
} from './studentHooks';

// Selectors
export {
    selectStudentState,
    selectStudentList,
    selectStudentTotal,
    selectStudentPage,
    selectStudentLimit,
    selectStudentFilters,
    selectSelectedStudent,
    selectStudentByIdFactory,
    selectStudentLoading,
    selectStudentErrors,
    selectStudentsByBatch,
    selectStudentsByStatus,
    selectStudentCount,
    selectIsStudentListLoading,
    selectStudentListError,
} from './studentSelectors';
