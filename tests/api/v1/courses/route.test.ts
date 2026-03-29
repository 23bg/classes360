import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { GET, POST } from "@/app/api/v1/courses/route";

const { mockReadSessionFromCookie, mockCourseService } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockCourseService: {
        getCourses: vi.fn(),
        createCourse: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/server/services/courses.service", () => ({
    courseService: mockCourseService,
}));

describe("/api/v1/courses", () => {
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

    it("GET lists courses for institute", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockCourseService.getCourses.mockResolvedValue([{ id: "c1" }]);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockCourseService.getCourses).toHaveBeenCalledWith("inst1");
    });

    it("POST returns forbidden for viewer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "VIEWER" });

        const request = new Request("http://localhost/api/v1/courses", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "JEE" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
        expect(mockCourseService.createCourse).not.toHaveBeenCalled();
    });

    it("POST creates course for writer role", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockCourseService.createCourse.mockResolvedValue({ id: "c1" });

        const request = new Request("http://localhost/api/v1/courses", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "JEE" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockCourseService.createCourse).toHaveBeenCalledWith({ instituteId: "inst1", name: "JEE" });
    });

    it("POST returns service error status", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1", role: "EDITOR" });
        mockCourseService.createCourse.mockRejectedValue(new AppError("Duplicate", 409, "DUPLICATE_COURSE"));

        const request = new Request("http://localhost/api/v1/courses", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ name: "JEE" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("DUPLICATE_COURSE");
    });
});
