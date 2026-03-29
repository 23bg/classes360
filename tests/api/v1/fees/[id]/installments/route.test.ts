import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/v1/fees/[id]/installments/route";

const { mockReadSessionFromCookie, mockFeeService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockFeeService: {
        getPlanById: vi.fn(),
        listInstallments: vi.fn(),
        addPayment: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({ readSessionFromCookie: mockReadSessionFromCookie }));
vi.mock("@/features/fee/services/fee.service", () => ({ feeService: mockFeeService }));

describe("/api/v1/fees/[id]/installments", () => {
    beforeEach(() => vi.clearAllMocks());

    it("GET returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);
        const response = await GET(new Request("http://localhost/api/v1/fees/f1/installments") as never, {
            params: Promise.resolve({ id: "f1" }),
        });
        expect(response.status).toBe(401);
    });

    it("GET verifies ownership and lists installments", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockFeeService.getPlanById.mockResolvedValue({ id: "f1" });
        mockFeeService.listInstallments.mockResolvedValue([{ id: "i1" }]);

        const response = await GET(new Request("http://localhost/api/v1/fees/f1/installments") as never, {
            params: Promise.resolve({ id: "f1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockFeeService.getPlanById).toHaveBeenCalledWith("f1", "inst1");
        expect(mockFeeService.listInstallments).toHaveBeenCalledWith("f1");
    });

    it("POST returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/fees/f1/installments", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ amount: 500 }),
        });

        const response = await POST(request as never, { params: Promise.resolve({ id: "f1" }) });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockFeeService.addPayment).not.toHaveBeenCalled();
    });
});
