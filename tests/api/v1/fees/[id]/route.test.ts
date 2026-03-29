import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET, PATCH, DELETE } from "@/app/api/v1/fees/[id]/route";

const { mockReadSessionFromCookie, mockFeeService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockFeeService: {
        getPlanById: vi.fn(),
        updatePlan: vi.fn(),
        deletePlan: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({ readSessionFromCookie: mockReadSessionFromCookie }));
vi.mock("@/features/fee/services/fee.service", () => ({ feeService: mockFeeService }));

describe("/api/v1/fees/[id]", () => {
    beforeEach(() => vi.clearAllMocks());

    it("GET returns plan for institute", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockFeeService.getPlanById.mockResolvedValue({ id: "f1" });

        const response = await GET(new Request("http://localhost/api/v1/fees/f1") as never, { params: Promise.resolve({ id: "f1" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockFeeService.getPlanById).toHaveBeenCalledWith("f1", "inst1");
    });

    it("PATCH returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/fees/f1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ totalAmount: 2000 }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "f1" }) });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockFeeService.updatePlan).not.toHaveBeenCalled();
    });

    it("DELETE forwards service error status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockFeeService.deletePlan.mockRejectedValue(new AppError("Not found", 404, "FEE_PLAN_NOT_FOUND"));

        const response = await DELETE(new Request("http://localhost/api/v1/fees/f1", { method: "DELETE" }) as never, {
            params: Promise.resolve({ id: "f1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FEE_PLAN_NOT_FOUND");
    });
});
