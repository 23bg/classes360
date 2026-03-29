export interface CourseType {
    id: string;
    institute_id: string;
    batch_id?: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface CourseListResponse {
    data: CourseType[];
    total: number;
    page: number;
    limit: number;
}

export interface CourseState {
    items: CourseType[];
    total: number;
    page: number;
    limit: number;

    selectedCourse: CourseType | null;

    listLoading: boolean;
    detailLoading: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;

    listError: string | null;
    detailError: string | null;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;

    currentFilters: {
        search?: string;
        batchId?: string;
    };
}

export const initialCourseState: CourseState = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,

    selectedCourse: null,

    listLoading: false,
    detailLoading: false,
    creating: false,
    updating: false,
    deleting: false,

    listError: null,
    detailError: null,
    createError: null,
    updateError: null,
    deleteError: null,

    currentFilters: {},
};
