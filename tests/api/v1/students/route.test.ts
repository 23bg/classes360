import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET, POST } from "@/app/api/v1/students/route";

const { mockReadSessionFromCookie, mockStudentService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockStudentService: {
        listStudents: vi.fn(),
        createStudent: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/server/services/students.service", () => ({
    studentService: mockStudentService,
}));

describe("/api/v1/students", () => {
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

    it("GET lists students for institute", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockStudentService.listStudents.mockResolvedValue([{ id: "s1" }]);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockStudentService.listStudents).toHaveBeenCalledWith("inst1");
    });

    it("POST creates student", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockStudentService.createStudent.mockResolvedValue({ id: "s1" });

        const request = new Request("http://localhost/api/v1/students", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Aman", phone: "9999999999" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockStudentService.createStudent).toHaveBeenCalledWith({
            instituteId: "inst1",
            name: "Aman",
            phone: "9999999999",
        });
    });

    it("POST returns service errors", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockStudentService.createStudent.mockRejectedValue(new AppError("Duplicate", 409, "DUPLICATE_STUDENT"));

        const request = new Request("http://localhost/api/v1/students", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "Aman", phone: "9999999999" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("DUPLICATE_STUDENT");
    });
});


