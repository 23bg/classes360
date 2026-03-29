import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/v1/auth/logout/route";

const { mockClearSessionCookie } = vi.hoisted(() => ({
    mockClearSessionCookie: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
    clearSessionCookie: mockClearSessionCookie,
}));

describe("POST /api/v1/auth/logout", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("clears cookie and returns success", async () => {
        const response = await POST();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.loggedOut).toBe(true);
        expect(mockClearSessionCookie).toHaveBeenCalledTimes(1);
    });
});

