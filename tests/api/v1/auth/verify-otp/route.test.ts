import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { POST } from "@/app/api/v1/auth/verify-otp/route";

const { mockAuthService } = vi.hoisted(() => ({
    mockAuthService: {
        verifyOtp: vi.fn(),
    },
}));

vi.mock("@/features/auth/services/auth.service", () => ({
    authService: mockAuthService,
}));

describe("POST /api/v1/auth/verify-otp", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns success data for valid otp", async () => {
        mockAuthService.verifyOtp.mockResolvedValue({ userId: "u1", redirectTo: "/dashboard" });

        const request = new Request("http://localhost/api/v1/auth/verify-otp", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: "owner@acme.com", otp: "12345" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockAuthService.verifyOtp).toHaveBeenCalledWith({ email: "owner@acme.com", otp: "12345" });
    });

    it("returns unauthorized when otp verification fails", async () => {
        mockAuthService.verifyOtp.mockRejectedValue(new AppError("Invalid OTP", 401, "INVALID_OTP"));

        const request = new Request("http://localhost/api/v1/auth/verify-otp", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: "owner@acme.com", otp: "12345" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("INVALID_OTP");
    });
});

