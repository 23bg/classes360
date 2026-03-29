import { describe, expect, it } from "vitest";
import { requestOtpValidation, verifyOtpValidation } from "@/validations/auth.validation";

describe("auth.validation", () => {
    it("accepts valid request otp payload", () => {
        const parsed = requestOtpValidation.parse({ email: "owner@acme.com" });
        expect(parsed.email).toBe("owner@acme.com");
    });

    it("rejects invalid request otp email", () => {
        const result = requestOtpValidation.safeParse({ email: "bad-email" });
        expect(result.success).toBe(false);
    });

    it("accepts valid verify otp payload", () => {
        const parsed = verifyOtpValidation.parse({ email: "owner@acme.com", otp: "12345" });
        expect(parsed.otp).toBe("12345");
    });

    it("rejects invalid verify otp payload", () => {
        const result = verifyOtpValidation.safeParse({ email: "owner@acme.com", otp: "12" });
        expect(result.success).toBe(false);
    });
});

