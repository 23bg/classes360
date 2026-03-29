import { beforeEach, describe, expect, it, vi } from "vitest";
import { PATCH, DELETE } from "@/app/api/v1/teams/[id]/route";

const { mockReadSessionFromCookie, mockTeamService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockTeamService: {
        updateMemberRole: vi.fn(),
        removeMember: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/features/team/services/team.service", () => ({
    teamService: mockTeamService,
}));

describe("/api/v1/teams/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("PATCH returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const request = new Request("http://localhost/api/v1/teams/u2", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ role: "VIEWER" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "u2" }) });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("PATCH returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER", userId: "u1" });

        const request = new Request("http://localhost/api/v1/teams/u2", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ role: "MANAGER" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "u2" }) });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockTeamService.updateMemberRole).not.toHaveBeenCalled();
    });

    it("PATCH updates member role for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "OWNER", userId: "u1" });
        mockTeamService.updateMemberRole.mockResolvedValue({ id: "u2", role: "MANAGER" });

        const request = new Request("http://localhost/api/v1/teams/u2", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ role: "MANAGER" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "u2" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockTeamService.updateMemberRole).toHaveBeenCalledWith("inst1", "OWNER", "u1", "u2", "MANAGER");
    });

    it("DELETE removes member for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "OWNER", userId: "u1" });
        mockTeamService.removeMember.mockResolvedValue({ success: true });

        const response = await DELETE(new Request("http://localhost/api/v1/teams/u2", { method: "DELETE" }) as never, {
            params: Promise.resolve({ id: "u2" }),
        });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockTeamService.removeMember).toHaveBeenCalledWith("inst1", "OWNER", "u1", "u2");
    });
});
