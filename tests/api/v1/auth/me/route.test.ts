import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/v1/auth/me/route";

const { mockAuth, mockSubscriptionService } = vi.hoisted(() => ({
    mockAuth: {
        createSessionToken: vi.fn(),
        readSessionFromCookie: vi.fn(),
        setSessionCookie: vi.fn(),
    },
    mockSubscriptionService: {
        getSubscription: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    createSessionToken: mockAuth.createSessionToken,
    readSessionFromCookie: mockAuth.readSessionFromCookie,
    setSessionCookie: mockAuth.setSessionCookie,
}));

vi.mock("@/features/subscription/services/subscription.service", () => ({
    subscriptionService: mockSubscriptionService,
}));

describe("GET /api/v1/auth/me", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns unauthorized when session is missing", async () => {
        mockAuth.readSessionFromCookie.mockResolvedValue(null);

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns profile data and refreshes cookie when status changed", async () => {
        mockAuth.readSessionFromCookie.mockResolvedValue({
            userId: "u1",
            email: "owner@acme.com",
            role: "OWNER",
            instituteId: "inst1",
            isOnboarded: true,
            subscriptionStatus: "TRIAL",
        });
        mockSubscriptionService.getSubscription.mockResolvedValue({ status: "ACTIVE" });
        mockAuth.createSessionToken.mockReturnValue("new-token");

        const response = await GET();
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(body.data.user.id).toBe("u1");
        expect(body.data.institute.subscriptionStatus).toBe("ACTIVE");
        expect(mockAuth.createSessionToken).toHaveBeenCalled();
        expect(mockAuth.setSessionCookie).toHaveBeenCalledWith("new-token");
    });
});

