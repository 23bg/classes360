import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/v1/leads/route";

const { mockReadSessionFromCookie, mockLeadService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockLeadService: {
        getLeads: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/server/services/leads.service", () => ({
    leadService: mockLeadService,
}));

describe("GET /api/v1/leads", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns unauthorized when session missing", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);
        const request = new NextRequest("http://localhost/api/v1/leads", { method: "GET" });

        const response = await GET(request as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("passes filters to service", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockLeadService.getLeads.mockResolvedValue([{ id: "l1" }]);

        const request = new NextRequest(
            "http://localhost/api/v1/leads?status=NEW&query=ram&from=2026-01-01&to=2026-01-31",
            { method: "GET" }
        );

        const response = await GET(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockLeadService.getLeads).toHaveBeenCalledWith("inst1", {
            status: "NEW",
            query: "ram",
            from: "2026-01-01",
            to: "2026-01-31",
        });
    });

    it("returns service error status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockLeadService.getLeads.mockRejectedValue(new AppError("Bad filter", 400, "INVALID_FILTER"));

        const request = new NextRequest("http://localhost/api/v1/leads", { method: "GET" });
        const response = await GET(request as never);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("INVALID_FILTER");
    });
});


