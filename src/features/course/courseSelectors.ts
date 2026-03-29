import { RootState } from '@/store';

export const selectCourseList = (state: RootState) => state.course.items;
export const selectCourseLoading = (state: RootState) => state.course.listLoading;
export const selectCourseError = (state: RootState) => state.course.listError;
export const selectSelectedCourse = (state: RootState) => state.course.selectedCourse;
