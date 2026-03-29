import { describe, expect, it } from "vitest";
import { AppError, toAppError } from "@/lib/utils/error";

describe("error utils", () => {
    it("constructs AppError with custom fields", () => {
        const error = new AppError("Boom", 400, "BAD_REQUEST", { field: "email" });

        expect(error.message).toBe("Boom");
        expect(error.statusCode).toBe(400);
        expect(error.code).toBe("BAD_REQUEST");
        expect(error.details).toEqual({ field: "email" });
    });

    it("returns same instance for AppError", () => {
        const input = new AppError("Nope", 401, "UNAUTHORIZED");
        expect(toAppError(input)).toBe(input);
    });

    it("wraps Error into AppError", () => {
        const result = toAppError(new Error("failure"));
        expect(result).toBeInstanceOf(AppError);
        expect(result.message).toBe("failure");
        expect(result.statusCode).toBe(500);
    });

    it("wraps unknown into default AppError", () => {
        const result = toAppError("bad");
        expect(result).toBeInstanceOf(AppError);
        expect(result.message).toBe("Unknown error");
        expect(result.code).toBe("INTERNAL_ERROR");
    });
});

