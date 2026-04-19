export type ApiErrorPayload = {
    message: string;
    code?: string;
    details?: unknown;
};

export const parseApiError = (error: unknown): string => {
    if (!error) {
        return "An unexpected error occurred.";
    }

    if (typeof error === "string") {
        return error;
    }

    if (error instanceof Error) {
        return error.message || "An unexpected error occurred.";
    }

    if (typeof error === "object" && error !== null) {
        const maybeMessage = (error as { message?: unknown }).message;
        if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
            return maybeMessage;
        }

        const maybeCode = (error as { code?: unknown }).code;
        if (typeof maybeCode === "string" && maybeCode.trim().length > 0) {
            return `Error: ${maybeCode}`;
        }
    }

    return "An unexpected error occurred.";
};
