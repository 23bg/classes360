import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AppError } from "@/lib/utils/error";
import { GET } from "@/app/api/v1/search/route";

const { mockReadSessionFromCookie, mockPrisma } = vi.hoisted(() => ({
    mockReadSessionFromCookie: vi.fn(),
    mockPrisma: {
        lead: { findMany: vi.fn() },
        student: { findMany: vi.fn() },
        course: { findMany: vi.fn() },
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    readSessionFromCookie: mockReadSessionFromCookie,
}));

vi.mock("@/lib/db/prisma", () => ({
    prisma: mockPrisma,
}));

describe("GET /api/v1/search", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns unauthorized without institute session", async () => {
        mockReadSessionFromCookie.mockResolvedValue(null);
        const response = await GET(new NextRequest("http://localhost/api/v1/search?q=ra") as never);
        const body = await response.json();
        expect(response.status).toBe(401);
        expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns empty buckets for short query", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        const response = await GET(new NextRequest("http://localhost/api/v1/search?q=a") as never);
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.data).toEqual({ leads: [], students: [], courses: [] });
    });

    it("returns aggregated results for valid query", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockPrisma.lead.findMany.mockResolvedValue([{ id: "l1" }]);
        mockPrisma.student.findMany.mockResolvedValue([{ id: "s1" }]);
        mockPrisma.course.findMany.mockResolvedValue([{ id: "c1" }]);

        const response = await GET(new NextRequest("http://localhost/api/v1/search?q=rahul") as never);
        const body = await response.json();
        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data).toEqual({ leads: [{ id: "l1" }], students: [{ id: "s1" }], courses: [{ id: "c1" }] });
    });

    it("maps internal errors to app error response", async () => {
        mockReadSessionFromCookie.mockResolvedValue({ instituteId: "inst1" });
        mockPrisma.lead.findMany.mockRejectedValue(new AppError("DB down", 503, "DB_DOWN"));
        const response = await GET(new NextRequest("http://localhost/api/v1/search?q=rahul") as never);
        const body = await response.json();
        expect(response.status).toBe(503);
        expect(body.error.code).toBe("DB_DOWN");
    });
});
