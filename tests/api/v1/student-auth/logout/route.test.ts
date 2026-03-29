import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/v1/student-auth/logout/route";

const { mockStudentAuth } = vi.hoisted(() => ({
    mockStudentAuth: {
        clearStudentSessionCookie: vi.fn(),
    },
}));

vi.mock("@/lib/auth/student-auth", () => ({
    clearStudentSessionCookie: mockStudentAuth.clearStudentSessionCookie,
}));

describe("POST /api/v1/student-auth/logout", () => {
    it("clears cookie and returns success", async () => {
        mockStudentAuth.clearStudentSessionCookie.mockResolvedValue(undefined);
        const response = await POST();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockStudentAuth.clearStudentSessionCookie).toHaveBeenCalledTimes(1);
    });
});
