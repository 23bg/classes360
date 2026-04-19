export type ApiSuccess<T> = {
    success: true;
    data: T;
};

export type ApiErrorPayload = {
    message: string;
    code?: string;
};

export type ApiFailure = {
    success: false;
    error: ApiErrorPayload;
};

export const ok = <T>(data: T): ApiSuccess<T> => ({
    success: true,
    data,
});

export const fail = (error: string | ApiErrorPayload): ApiFailure => ({
    success: false,
    error: typeof error === "string" ? { message: error } : error,
});
