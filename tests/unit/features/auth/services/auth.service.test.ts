import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@/lib/utils/error";
import { authService } from "@/features/auth/services/auth.service";

const {
    mockAuth,
    mockOtpRepository,
    mockUserRepository,
    mockInstituteRepository,
    mockSubscriptionService,
} = vi.hoisted(() => ({
    mockAuth: {
        createSessionToken: vi.fn(),
        setSessionCookie: vi.fn(),
    },
    mockOtpRepository: {
        verifyOtp: vi.fn(),
        deleteAllByEmail: vi.fn(),
    },
    mockUserRepository: {
        findByEmail: vi.fn(),
        updateByEmail: vi.fn(),
    },
    mockInstituteRepository: {
        create: vi.fn(),
        findById: vi.fn(),
    },
    mockSubscriptionService: {
        getSubscription: vi.fn(),
    },
}));

vi.mock("@/lib/auth/auth", () => ({
    createSessionToken: mockAuth.createSessionToken,
    setSessionCookie: mockAuth.setSessionCookie,
    SubscriptionStatus: {},
}));

vi.mock("@/features/auth/repositories/otp.repo", () => ({
    otpRepository: mockOtpRepository,
}));

vi.mock("@/features/auth/repositories/user.repo", () => ({
    userRepository: mockUserRepository,
}));

vi.mock("@/features/institute/repositories/institute.repo", () => ({
    instituteRepository: mockInstituteRepository,
}));

vi.mock("@/features/subscription/services/subscription.service", () => ({
    subscriptionService: mockSubscriptionService,
}));

vi.mock("@/lib/services/mailer.service", () => ({
    mailerService: {
        sendOtpEmail: vi.fn(),
    },
}));

describe("authService.verifyOtp", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuth.createSessionToken.mockReturnValue("session-token");
    });

    it("creates institute for first-time user and redirects to onboarding", async () => {
        mockOtpRepository.verifyOtp.mockResolvedValue(true);
        mockOtpRepository.deleteAllByEmail.mockResolvedValue(undefined);

        mockUserRepository.findByEmail.mockResolvedValue({
            id: "user-1",
            email: "owner@acme.com",
            role: "OWNER",
            instituteId: null,
        });

        mockInstituteRepository.create.mockResolvedValue({ id: "inst-1", isOnboarded: false });
        mockUserRepository.updateByEmail.mockResolvedValue({
            id: "user-1",
            email: "owner@acme.com",
            role: "OWNER",
            instituteId: "inst-1",
        });
        mockSubscriptionService.getSubscription.mockResolvedValue({ status: "TRIAL" });
        mockInstituteRepository.findById.mockResolvedValue({ id: "inst-1", isOnboarded: false });
        mockAuth.setSessionCookie.mockResolvedValue(undefined);

        const result = await authService.verifyOtp({ email: "owner@acme.com", otp: "12345" });

        expect(mockInstituteRepository.create).toHaveBeenCalledWith(
            expect.objectContaining({
                name: null,
                isOnboarded: false,
                slug: expect.stringContaining("temp-owner"),
            }),
        );
        expect(mockUserRepository.updateByEmail).toHaveBeenCalledWith(
            "owner@acme.com",
            expect.objectContaining({ instituteId: "inst-1", emailVerified: true, role: "OWNER" }),
        );
        expect(mockAuth.createSessionToken).toHaveBeenCalledWith(expect.objectContaining({ instituteId: "inst-1", isOnboarded: false }));
        expect(mockAuth.setSessionCookie).toHaveBeenCalledWith("session-token");
        expect(result.redirectTo).toBe("/onboarding");
    });

    it("returns dashboard redirect for onboarded trial user", async () => {
        mockOtpRepository.verifyOtp.mockResolvedValue(true);
        mockOtpRepository.deleteAllByEmail.mockResolvedValue(undefined);
        mockUserRepository.findByEmail.mockResolvedValue({
            id: "user-2",
            email: "editor@acme.com",
            role: "EDITOR",
            instituteId: "inst-2",
        });
        mockSubscriptionService.getSubscription.mockResolvedValue({ status: "TRIAL" });
        mockInstituteRepository.findById.mockResolvedValue({ id: "inst-2", isOnboarded: true });
        mockAuth.setSessionCookie.mockResolvedValue(undefined);

        const result = await authService.verifyOtp({ email: "editor@acme.com", otp: "54321" });

        expect(result.redirectTo).toBe("/dashboard");
        expect(result.subscriptionStatus).toBe("TRIAL");
        expect(mockAuth.setSessionCookie).toHaveBeenCalledTimes(1);
    });

    it("throws unauthorized for invalid otp", async () => {
        mockOtpRepository.verifyOtp.mockResolvedValue(false);

        await expect(authService.verifyOtp({ email: "owner@acme.com", otp: "99999" })).rejects.toMatchObject({
            statusCode: 401,
            code: "INVALID_OTP",
        });
    });
});
