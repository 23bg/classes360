import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET } from "@/app/api/v1/leads/[id]/timeline/route";

const { mockReadSessionFromCookie, mockLeadService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockLeadService: {
        getLeadTimeline: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/server/services/leads.service", () => ({
    leadService: mockLeadService,
}));

describe("GET /api/v1/leads/[id]/timeline", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns unauthorized when session missing", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const response = await GET(new Request("http://localhost/api/v1/leads/l1/timeline") as never, {
            params: Promise.resolve({ id: "l1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns timeline data for authorized institute user", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockLeadService.getLeadTimeline.mockResolvedValue([
            { activityType: "LEAD_CREATED", title: "Lead created", createdAt: "2026-03-01T00:00:00.000Z" },
        ]);

        const response = await GET(new Request("http://localhost/api/v1/leads/l1/timeline") as never, {
            params: Promise.resolve({ id: "l1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockLeadService.getLeadTimeline).toHaveBeenCalledWith("inst1", "l1");
    });

    it("returns lead service error status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockLeadService.getLeadTimeline.mockRejectedValue(new AppError("Lead not found", 404, "LEAD_NOT_FOUND"));

        const response = await GET(new Request("http://localhost/api/v1/leads/l1/timeline") as never, {
            params: Promise.resolve({ id: "l1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("LEAD_NOT_FOUND");
    });
});

