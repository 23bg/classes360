export type ApiError = {
    message: string;
    code?: string;
    details?: unknown;
};

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: Record<string, unknown>;
}

