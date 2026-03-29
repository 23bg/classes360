import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { POST } from "@/app/api/v1/announcements/route";

const { mockReadSessionFromCookie, mockStudentService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockStudentService: {
        createAnnouncement: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/server/services/students.service", () => ({
    studentService: mockStudentService,
}));

describe("POST /api/v1/announcements", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);
        const response = await POST(new Request("http://localhost/api/v1/announcements", { method: "POST", body: "{}" }) as never);
        expect(response.status).toBe(401);
    });

    it("returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });
        const request = new Request("http://localhost/api/v1/announcements", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title: "Holiday", body: "Closed" }),
        });
        const response = await POST(request as never);
        const body = await response.json();
        expect(response.status).toBe(403);
        expect(body.error.code).toBe("FORBIDDEN");
    });

    it("creates announcement for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockStudentService.createAnnouncement.mockResolvedValue({ success: true });

        const request = new Request("http://localhost/api/v1/announcements", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title: "Holiday", body: "Closed", batchId: null }),
        });
        const response = await POST(request as never);
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockStudentService.createAnnouncement).toHaveBeenCalledWith("inst1", {
            title: "Holiday",
            body: "Closed",
            batchId: null,
        });
    });

    it("returns service errors", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockStudentService.createAnnouncement.mockRejectedValue(new AppError("Invalid", 400, "INVALID_ANNOUNCEMENT"));
        const request = new Request("http://localhost/api/v1/announcements", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ title: "", body: "" }),
        });
        const response = await POST(request as never);
        const body = await response.json();
        expect(response.status).toBe(400);
        expect(body.error.code).toBe("INVALID_ANNOUNCEMENT");
    });
});
