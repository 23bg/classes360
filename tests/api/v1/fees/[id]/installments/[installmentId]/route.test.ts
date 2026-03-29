import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH, DELETE } from "@/app/api/v1/fees/[id]/installments/[installmentId]/route";

const { mockReadSessionFromCookie, mockFeeService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockFeeService: {
        markInstallmentPaid: vi.fn(),
        updateInstallmentStatus: vi.fn(),
        deleteInstallment: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({ readSessionFromCookie: mockReadSessionFromCookie }));
vi.mock("@/features/fee/services/fee.service", () => ({ feeService: mockFeeService }));

describe("/api/v1/fees/[id]/installments/[installmentId]", () => {
    beforeEach(() => vi.clearAllMocks());

    it("PATCH with PAID uses institute-scoped markInstallmentPaid", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockFeeService.markInstallmentPaid.mockResolvedValue({ id: "ins1", status: "PAID" });

        const request = new Request("http://localhost/api/v1/fees/f1/installments/ins1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: "PAID" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "f1", installmentId: "ins1" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockFeeService.markInstallmentPaid).toHaveBeenCalledWith("inst1", "ins1");
    });

    it("PATCH non-PAID uses institute-scoped updateInstallmentStatus", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockFeeService.updateInstallmentStatus.mockResolvedValue({ id: "ins1", status: "OVERDUE" });

        const request = new Request("http://localhost/api/v1/fees/f1/installments/ins1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: "OVERDUE" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "f1", installmentId: "ins1" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockFeeService.updateInstallmentStatus).toHaveBeenCalledWith("inst1", "ins1", "OVERDUE");
    });

    it("DELETE returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const response = await DELETE(new Request("http://localhost/api/v1/fees/f1/installments/ins1", { method: "DELETE" }) as never, {
            params: Promise.resolve({ id: "f1", installmentId: "ins1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockFeeService.deleteInstallment).not.toHaveBeenCalled();
    });
});
