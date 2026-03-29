import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { POST } from "@/app/api/v1/auth/request-otp/route";

const { mockAuthService } = vi.hoisted(() => ({
    mockAuthService: {
        requestOtp: vi.fn(),
    },
}));

vi.mock("@/features/auth/services/auth.service", () => ({
    authService: mockAuthService,
}));

describe("POST /api/v1/auth/request-otp", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns success payload for valid request", async () => {
        mockAuthService.requestOtp.mockResolvedValue({ expiresAt: "2026-02-27T10:00:00.000Z" });

        const request = new Request("http://localhost/api/v1/auth/request-otp", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "x-forwarded-for": "10.0.0.1",
            },
            body: JSON.stringify({ email: "owner@acme.com" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockAuthService.requestOtp).toHaveBeenCalledWith({ email: "owner@acme.com", ip: "10.0.0.1" });
    });

    it("returns service error status when service fails", async () => {
        mockAuthService.requestOtp.mockRejectedValue(new AppError("Rate limited", 429, "RATE_LIMITED"));

        const request = new Request("http://localhost/api/v1/auth/request-otp", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: "owner@acme.com" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(429);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("RATE_LIMITED");
    });
});

