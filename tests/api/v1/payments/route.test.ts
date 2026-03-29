import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AppError } from "@/lib/utils/error";
import { GET } from "@/app/api/v1/payments/route";

const { mockReadSessionFromCookie, mockFeeService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockFeeService: {
        listPayments: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/features/fee/services/fee.service", () => ({
    feeService: mockFeeService,
}));

describe("GET /api/v1/payments", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const request = new NextRequest("http://localhost/api/v1/payments", { method: "GET" });
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("forwards filters to fee service", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockFeeService.listPayments.mockResolvedValue([{ id: "p1", amount: 1000 }]);

        const request = new NextRequest(
            "http://localhost/api/v1/payments?from=2026-02-01&to=2026-02-28&studentId=s1&method=UPI&limit=20",
            { method: "GET" }
        );

        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockFeeService.listPayments).toHaveBeenCalledWith("inst1", {
            from: "2026-02-01",
            to: "2026-02-28",
            studentId: "s1",
            method: "UPI",
            limit: 20,
        });
    });

    it("returns app error status when service fails", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockFeeService.listPayments.mockRejectedValue(new AppError("Bad request", 400, "INVALID_FILTER"));

        const request = new NextRequest("http://localhost/api/v1/payments", { method: "GET" });
        const response = await GET(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("INVALID_FILTER");
    });
});

