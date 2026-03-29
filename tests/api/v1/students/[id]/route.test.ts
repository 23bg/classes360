import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { PATCH, DELETE } from "@/app/api/v1/students/[id]/route";

const { mockReadSessionFromCookie, mockStudentService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockStudentService: {
        updateStudent: vi.fn(),
        deleteStudent: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/server/services/students.service", () => ({
    studentService: mockStudentService,
}));

describe("/api/v1/students/[id]", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("PATCH returns unauthorized without session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);

        const request = new Request("http://localhost/api/v1/students/s1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Updated" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "s1" }) });
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
    });

    it("PATCH returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/students/s1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Updated" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "s1" }) });
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockStudentService.updateStudent).not.toHaveBeenCalled();
    });

    it("PATCH updates student for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockStudentService.updateStudent.mockResolvedValue({ id: "s1", name: "Updated" });

        const request = new Request("http://localhost/api/v1/students/s1", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Updated" }),
        });

        const response = await PATCH(request as never, { params: Promise.resolve({ id: "s1" }) });
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockStudentService.updateStudent).toHaveBeenCalledWith("inst1", "s1", { name: "Updated" });
    });

    it("DELETE returns service errors", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockStudentService.deleteStudent.mockRejectedValue(new AppError("Not found", 404, "STUDENT_NOT_FOUND"));

        const response = await DELETE(new Request("http://localhost/api/v1/students/s1", { method: "DELETE" }) as never, {
            params: Promise.resolve({ id: "s1" }),
        });
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("STUDENT_NOT_FOUND");
    });
});

