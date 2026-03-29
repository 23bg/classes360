export interface StudentType {
    id: string;
    institute_id: string;
    name: string;
    email?: string;
    phone?: string;
    batch_id?: string;
    status: 'active' | 'inactive' | 'graduated' | 'dropped';
    enrollment_date?: string;
    created_at: string;
    updated_at: string;
}

export interface StudentListResponse {
    data: StudentType[];
    total: number;
    page: number;
    limit: number;
}

export interface StudentState {
    // List state
    items: StudentType[];
    total: number;
    page: number;
    limit: number;

    // Detail state
    selectedStudent: StudentType | null;

    // Loading states
    listLoading: boolean;
    detailLoading: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;

    // Error states
    listError: string | null;
    detailError: string | null;
    createError: string | null;
    updateError: string | null;
    deleteError: string | null;

    // Filters
    currentFilters: {
        search?: string;
        batchId?: string;
        status?: string;
    };
}

export const initialStudentState: StudentState = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,

    selectedStudent: null,

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
