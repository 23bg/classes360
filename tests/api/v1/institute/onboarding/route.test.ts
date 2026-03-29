import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { POST } from "@/app/api/v1/institute/onboarding/route";

const { mockAuth, mockInstituteService } = vi.hoisted(() => ({
    mockAuth: {
        createSessionToken: vi.fn(),
        readSessionFromCookie: vi.fn(),
        setSessionCookie: vi.fn(),
    },
    mockInstituteService: {
        completeOnboarding: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    createSessionToken: mockAuth.createSessionToken,
    readSessionFromCookie: mockAuth.readSessionFromCookie,
    setSessionCookie: mockAuth.setSessionCookie,
}));

vi.mock("@/features/institute/services/institute.service", () => ({
    instituteService: mockInstituteService,
}));

describe("POST /api/v1/institute/onboarding", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns unauthorized when session is missing", async () => {
        mockAuth.readSessionFromCookie.mockResolvedValue(null);

        const request = new Request("http://localhost/api/v1/institute/onboarding", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({}),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("UNAUTHORIZED");
    });

    it("returns forbidden for viewer role", async () => {
        mockAuth.readSessionFromCookie.mockResolvedValue({
            userId: "u1",
            email: "owner@acme.com",
            role: "VIEWER",
            instituteId: "inst1",
            isOnboarded: false,
            subscriptionStatus: "TRIAL",
        });

        const request = new Request("http://localhost/api/v1/institute/onboarding", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name: "Acme",
                phone: "9876543210",
                address: { addressLine1: "Main road", city: "Pune", state: "MH", country: "India" },
            }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(403);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("FORBIDDEN");
    });

    it("completes onboarding and refreshes session token", async () => {
        mockAuth.readSessionFromCookie.mockResolvedValue({
            userId: "u1",
            email: "owner@acme.com",
            role: "OWNER",
            instituteId: "inst1",
            isOnboarded: false,
            subscriptionStatus: "TRIAL",
        });
        mockInstituteService.completeOnboarding.mockResolvedValue({ id: "inst1", isOnboarded: true });
        mockAuth.createSessionToken.mockReturnValue("next-token");

        const request = new Request("http://localhost/api/v1/institute/onboarding", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name: "Acme Institute",
                phone: "9876543210",
                address: { addressLine1: "Main road", city: "Pune", state: "MH", country: "India" },
            }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockInstituteService.completeOnboarding).toHaveBeenCalledWith("inst1", expect.any(Object));
        expect(mockAuth.createSessionToken).toHaveBeenCalledWith(expect.objectContaining({ isOnboarded: true }));
        expect(mockAuth.setSessionCookie).toHaveBeenCalledWith("next-token");
    });

    it("returns service error status", async () => {
        mockAuth.readSessionFromCookie.mockResolvedValue({
            userId: "u1",
            email: "owner@acme.com",
            role: "OWNER",
            instituteId: "inst1",
            isOnboarded: false,
            subscriptionStatus: "TRIAL",
        });
        mockInstituteService.completeOnboarding.mockRejectedValue(new AppError("Slug exists", 409, "SLUG_ALREADY_EXISTS"));

        const request = new Request("http://localhost/api/v1/institute/onboarding", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name: "Acme",
                phone: "9876543210",
                address: { addressLine1: "Main road", city: "Pune", state: "MH", country: "India" },
            }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("SLUG_ALREADY_EXISTS");
    });
});
