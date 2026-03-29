import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET } from "@/app/api/v1/student-portal/me/route";

const { mockStudentAuth, mockStudentService } = vi.hoisted(() => ({
    mockStudentAuth: {
        readStudentSessionFromCookie: vi.fn(),
    },
    mockStudentService: {
        getPortalData: vi.fn(),
    },
}));

vi.mock("@/lib/auth/student-auth", () => ({
    readStudentSessionFromCookie: mockStudentAuth.readStudentSessionFromCookie,
}));

vi.mock("@/server/services/students.service", () => ({
    studentService: mockStudentService,
}));

describe("GET /api/v1/student-portal/me", () => {
    beforeEach(() => vi.clearAllMocks());

    it("returns unauthorized when student session missing", async () => {
        mockStudentAuth.readStudentSessionFromCookie.mockResolvedValue(null);
        const response = await GET();
        const body = await response.json();
        expect(response.status).toBe(401);
        expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns portal data for valid student session", async () => {
        mockStudentAuth.readStudentSessionFromCookie.mockResolvedValue({ studentId: "s1", instituteId: "inst1", name: "A" });
        mockStudentService.getPortalData.mockResolvedValue({ student: { id: "s1" }, announcements: [] });

        const response = await GET();
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockStudentService.getPortalData).toHaveBeenCalledWith("s1", "inst1");
    });

    it("returns service error status", async () => {
        mockStudentAuth.readStudentSessionFromCookie.mockResolvedValue({ studentId: "s1", instituteId: "inst1", name: "A" });
        mockStudentService.getPortalData.mockRejectedValue(new AppError("Student not found", 404, "STUDENT_NOT_FOUND"));

        const response = await GET();
        const body = await response.json();
        expect(response.status).toBe(404);
        expect(body.error.code).toBe("STUDENT_NOT_FOUND");
    });
});
