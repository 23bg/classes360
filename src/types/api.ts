export interface AppError {
    message: string;
    // The backend may include other fields like a specific error code or details.
    // Add them here as they are needed.
}

export interface ApiResponse<T> {
    success: boolean;
    data: T | null;
    error?: AppError;
    meta?: Record<string, unknown>;
}

