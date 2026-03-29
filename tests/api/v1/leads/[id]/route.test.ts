import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH } from "@/app/api/v1/leads/[id]/route";

const { mockReadSessionFromCookie, mockLeadService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockLeadService: {
        updateLead: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/server/services/leads.service", () => ({
    leadService: mockLeadService,
}));

describe("PATCH /api/v1/leads/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const request = new Request("http://localhost/api/v1/leads/l1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: "NEW" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "l1" }) });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("returns bad request when payload is empty", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "MANAGER" });

        const request = new Request("http://localhost/api/v1/leads/l1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({}),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "l1" }) });
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("INVALID_PAYLOAD");
    });

    it("returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/leads/l1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: "CONTACTED" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "l1" }) });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockLeadService.updateLead).not.toHaveBeenCalled();
    });

    it("updates lead when payload is valid", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "MANAGER" });
        mockLeadService.updateLead.mockResolvedValue({ id: "l1", status: "ADMITTED" });

        const request = new Request("http://localhost/api/v1/leads/l1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ status: "ADMITTED", message: "Joined" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "l1" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockLeadService.updateLead).toHaveBeenCalledWith("inst1", "l1", {
            status: "ADMITTED",
            message: "Joined",
            followUpAt: undefined,
        });
    });
});


