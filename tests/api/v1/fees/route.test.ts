import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/v1/fees/route";

const { mockReadSessionFromCookie, mockFeeService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockFeeService: {
        getStudentPaymentSummary: vi.fn(),
        listPlans: vi.fn(),
        createPlan: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/features/fee/services/fee.service", () => ({
    feeService: mockFeeService,
}));

describe("/api/v1/fees", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const response = await GET(new NextRequest("http://localhost/api/v1/fees") as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("GET with studentId uses institute-scoped summary", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockFeeService.getStudentPaymentSummary.mockResolvedValue({ totalFees: 1000, totalPaid: 500, totalPending: 500 });

        const response = await GET(new NextRequest("http://localhost/api/v1/fees?studentId=s1") as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockFeeService.getStudentPaymentSummary).toHaveBeenCalledWith("inst1", "s1");
    });

    it("POST returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/fees", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ studentId: "s1", totalAmount: 1000 }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockFeeService.createPlan).not.toHaveBeenCalled();
    });

    it("POST forwards service errors", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockFeeService.createPlan.mockRejectedValue(new AppError("Invalid", 400, "INVALID_FEE_PLAN"));

        const request = new Request("http://localhost/api/v1/fees", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ studentId: "s1", totalAmount: 1000 }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("INVALID_FEE_PLAN");
    });
});
