import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET, POST } from "@/app/api/v1/teachers/route";

const { mockReadSessionFromCookie, mockTeacherService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockTeacherService: {
        listTeachers: vi.fn(),
        createTeacher: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/features/teacher/services/teacher.service", () => ({
    teacherService: mockTeacherService,
}));

describe("/api/v1/teachers", () => {
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

    it("GET lists teachers for institute", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockTeacherService.listTeachers.mockResolvedValue([{ id: "t1" }]);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockTeacherService.listTeachers).toHaveBeenCalledWith("inst1");
    });

    it("POST returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/teachers", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Sharma" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockTeacherService.createTeacher).not.toHaveBeenCalled();
    });

    it("POST creates teacher for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockTeacherService.createTeacher.mockResolvedValue({ id: "t1" });

        const request = new Request("http://localhost/api/v1/teachers", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Sharma", subject: "Physics" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockTeacherService.createTeacher).toHaveBeenCalledWith({ instituteId: "inst1", name: "Sharma", subject: "Physics" });
    });

    it("POST returns service error status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockTeacherService.createTeacher.mockRejectedValue(new AppError("Duplicate", 409, "DUPLICATE_TEACHER"));

        const request = new Request("http://localhost/api/v1/teachers", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Sharma", subject: "Physics" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("DUPLICATE_TEACHER");
    });
});
