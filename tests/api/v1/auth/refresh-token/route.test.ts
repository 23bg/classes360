import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/v1/auth/refresh-token/route";

const { mockAuth } = vi.hoisted(() => ({
    mockAuth: {
        createSessionToken: vi.fn(),
        setSessionCookie: vi.fn(),
        verifySessionToken: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    createSessionToken: mockAuth.createSessionToken,
    setSessionCookie: mockAuth.setSessionCookie,
    verifySessionToken: mockAuth.verifySessionToken,
}));

describe("POST /api/v1/auth/refresh-token", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns unauthorized when token is missing", async () => {
        const request = new NextRequest("http://localhost/api/v1/auth/refresh-token", { method: "POST" });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns unauthorized when token is invalid", async () => {
        mockAuth.verifySessionToken.mockReturnValue(null);

        const request = new NextRequest("http://localhost/api/v1/auth/refresh-token", {
            method: "POST",
            headers: { cookie: "session_token=bad-token" },
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error.message).toContain("Invalid session");
    });

    it("refreshes session when token is valid", async () => {
        mockAuth.verifySessionToken.mockReturnValue({
            userId: "u1",
            email: "owner@acme.com",
            role: "OWNER",
            instituteId: "inst1",
            isOnboarded: true,
            subscriptionStatus: "ACTIVE",
        });
        mockAuth.createSessionToken.mockReturnValue("new-token");

        const request = new NextRequest("http://localhost/api/v1/auth/refresh-token", {
            method: "POST",
            headers: { cookie: "session_token=valid-token" },
        });

        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.refreshed).toBe(true);
        expect(mockAuth.setSessionCookie).toHaveBeenCalledWith("new-token");
    });
});

