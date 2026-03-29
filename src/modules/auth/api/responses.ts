export type ApiSuccess<T> = {
    success: true;
    data: T;
};

export type ApiFailure = {
    success: false;
    error: string;
};

export const ok = <T>(data: T): ApiSuccess<T> => ({
    success: true,
    data,
});

export const fail = (error: string): ApiFailure => ({
    success: false,
    error,
});
