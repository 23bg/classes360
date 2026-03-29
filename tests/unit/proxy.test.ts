import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";

const { mockVerifySessionToken } = vi.hoisted(() => ({
    mockVerifySessionToken: vi.fn(),
}));

vi.mock("@/lib/auth/auth", () => ({
    verifySessionToken: mockVerifySessionToken,
}));

const makeRequest = (url: string, token?: string) =>
    new NextRequest(url, token ? { headers: { cookie: `session_token=${token}` } } : undefined);

describe("proxy route guards", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("normalizes /dashboard paths", () => {
        const response = proxy(makeRequest("http://localhost/dashboard/leads"));
        expect(response.headers.get("location")).toBe("http://localhost/leads");
    });

    it("redirects unauthenticated protected path to login with next", () => {
        const response = proxy(makeRequest("http://localhost/students"));
        expect(response.headers.get("location")).toBe("http://localhost/login?next=%2Fstudents");
    });

    it("redirects unauthenticated onboarding access to login", () => {
        const response = proxy(makeRequest("http://localhost/onboarding"));
        expect(response.headers.get("location")).toBe("http://localhost/login");
    });

    it("redirects non-onboarded users away from dashboard routes", () => {
        mockVerifySessionToken.mockReturnValue({
            isOnboarded: false,
            subscriptionStatus: "TRIAL",
        });

        const response = proxy(makeRequest("http://localhost/leads", "valid"));
        expect(response.headers.get("location")).toBe("http://localhost/onboarding");
    });

    it("redirects onboarded users away from login", () => {
        mockVerifySessionToken.mockReturnValue({
            isOnboarded: true,
            subscriptionStatus: "ACTIVE",
        });

        const response = proxy(makeRequest("http://localhost/login", "valid"));
        expect(response.headers.get("location")).toBe("http://localhost/");
    });

    it("enforces billing gate for inactive subscriptions", () => {
        mockVerifySessionToken.mockReturnValue({
            isOnboarded: true,
            subscriptionStatus: "INACTIVE",
        });

        const response = proxy(makeRequest("http://localhost/fees", "valid"));
        expect(response.headers.get("location")).toBe("http://localhost/billing");
    });

    it("allows active subscriptions on protected routes", () => {
        mockVerifySessionToken.mockReturnValue({
            isOnboarded: true,
            subscriptionStatus: "ACTIVE",
        });

        const response = proxy(makeRequest("http://localhost/fees", "valid"));
        expect(response.headers.get("location")).toBeNull();
        expect(response.status).toBe(200);
    });

});
