export interface BatchType {
    id: string;
    institute_id: string;
    name: string;
    start_date?: string;
    end_date?: string;
    created_at: string;
    updated_at: string;
}

export interface BatchListResponse {
    data: BatchType[];
    total: number;
    page: number;
    limit: number;
}

export interface BatchState {
    items: BatchType[];
    total: number;
    page: number;
    limit: number;

    selectedBatch: BatchType | null;

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
    };
}

export const initialBatchState: BatchState = {
    items: [],
    total: 0,
    page: 1,
    limit: 20,

    selectedBatch: null,

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
