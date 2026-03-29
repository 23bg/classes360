import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
    fetchCourses,
    fetchCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    removeCourseOptimistic,
} from './courseSlice';
import type { FetchCoursesParams, CreateCoursePayload, UpdateCoursePayload } from './courseApi';

export const useCourseList = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.course);

    const loadCourses = (params: FetchCoursesParams) => {
        dispatch(fetchCourses(params));
    };

    return {
        courses: state.items,
        total: state.total,
        loading: state.listLoading,
        error: state.listError,
        loadCourses,
    };
};

export const useCourseMutations = () => {
    const dispatch = useDispatch<AppDispatch>();
    const state = useSelector((state: RootState) => state.course);

    const handleCreateCourse = (payload: CreateCoursePayload) => {
        return dispatch(createCourse(payload));
    };

    const handleUpdateCourse = (payload: UpdateCoursePayload) => {
        return dispatch(updateCourse(payload));
    };

    const handleDeleteCourse = (id: string) => {
        dispatch(removeCourseOptimistic(id));
        return dispatch(deleteCourse(id));
    };

    return {
        creating: state.creating,
        updating: state.updating,
        deleting: state.deleting,
        createError: state.createError,
        updateError: state.updateError,
        deleteError: state.deleteError,
        createCourse: handleCreateCourse,
        updateCourse: handleUpdateCourse,
        deleteCourse: handleDeleteCourse,
    };
};

export const useCourse = () => {
    const list = useCourseList();
    const mutations = useCourseMutations();
    return { ...list, ...mutations };
};
