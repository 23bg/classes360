import { logger, serializeError } from "@/lib/logger";

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: unknown;

    constructor(message: string, statusCode = 500, code = "INTERNAL_ERROR", details?: unknown) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
    }
}

export const toAppError = (error: unknown): AppError => {
    if (error instanceof AppError) return error;
    if (error instanceof Error) {
        logger.error({
            event: "unexpected_error_mapped",
            error: serializeError(error),
        });
        return new AppError(error.message);
    }

    logger.error({
        event: "unknown_non_error_mapped",
        error: serializeError(error),
    });

    return new AppError("Unknown error");
};

