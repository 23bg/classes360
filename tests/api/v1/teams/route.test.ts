import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET, POST } from "@/app/api/v1/teams/route";

const { mockReadSessionFromCookie, mockTeamService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockTeamService: {
        listMembers: vi.fn(),
        createMember: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/features/team/services/team.service", () => ({
    teamService: mockTeamService,
}));

describe("/api/v1/teams", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("GET returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("GET lists team members", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockTeamService.listMembers.mockResolvedValue([{ id: "u1" }]);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockTeamService.listMembers).toHaveBeenCalledWith("inst1");
    });

    it("POST returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/teams", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: "x@test.com", role: "VIEWER" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockTeamService.createMember).not.toHaveBeenCalled();
    });

    it("POST creates member for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "OWNER" });
        mockTeamService.createMember.mockResolvedValue({ id: "u2" });

        const request = new Request("http://localhost/api/v1/teams", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: "x@test.com", name: "X", role: "VIEWER" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockTeamService.createMember).toHaveBeenCalledWith("inst1", "OWNER", {
            email: "x@test.com",
            name: "X",
            role: "VIEWER",
        });
    });

    it("POST returns service error status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "OWNER" });
        mockTeamService.createMember.mockRejectedValue(new AppError("Already member", 409, "TEAM_MEMBER_EXISTS"));

        const request = new Request("http://localhost/api/v1/teams", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ email: "x@test.com", role: "VIEWER" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("TEAM_MEMBER_EXISTS");
    });
});
