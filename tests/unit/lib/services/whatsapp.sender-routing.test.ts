import { beforeEach, describe, expect, it, vi } from "vitest";

const {
    mockPrisma,
    mockSubscriptionService,
    mockBillingService,
    mockBillingRepo,
    mockWhatsAppIntegrationService,
} = vi.hoisted(() => ({
    mockPrisma: {
        whatsAppMessage: {
            count: vi.fn(),
            create: vi.fn(),
        },
    },
    mockSubscriptionService: {
        getSubscription: vi.fn(),
    },
    mockBillingService: {
        getOperationalPolicy: vi.fn(),
    },
    mockBillingRepo: {
        upsertMonthlyUsage: vi.fn(),
    },
    mockWhatsAppIntegrationService: {
        getSenderRouting: vi.fn(),
        markSenderFailure: vi.fn(),
    },
}));

vi.mock("@/lib/config/env", () => ({
    env: {
        WHATSAPP_PHONE_NUMBER_ID: "shared_phone_id",
        WHATSAPP_ACCESS_TOKEN: "token",
        WHATSAPP_API_VERSION: "v19.0",
    },
}));

vi.mock("@/lib/db/prisma", () => ({
    prisma: mockPrisma,
}));

vi.mock("@/features/subscription/services/subscription.service", () => ({
    subscriptionService: mockSubscriptionService,
}));

vi.mock("@/features/billing/services/billing.service", () => ({
    billingService: mockBillingService,
}));

vi.mock("@/features/billing/repositories/billing.repo", () => ({
    billingRepository: mockBillingRepo,
}));

vi.mock("@/features/whatsapp/services/whatsapp-integration.service", () => ({
    whatsappIntegrationService: mockWhatsAppIntegrationService,
}));

import { sendSystemAlert } from "@/lib/services/whatsapp";

describe("sendSystemAlert sender routing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockBillingService.getOperationalPolicy.mockResolvedValue({ canSendAlerts: true });
        mockSubscriptionService.getSubscription.mockResolvedValue({ planType: "STARTER", userLimit: 1 });
        mockPrisma.whatsAppMessage.count.mockResolvedValueOnce(5).mockResolvedValueOnce(2);
        mockPrisma.whatsAppMessage.create.mockResolvedValue({ id: "msg1" });
        mockBillingRepo.upsertMonthlyUsage.mockResolvedValue({});
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ messages: [{ id: "provider_msg_1" }] }),
        } as Response);
    });

    it("uses shared sender when institute has no connected sender", async () => {
        mockWhatsAppIntegrationService.getSenderRouting.mockResolvedValue({
            mode: "CLASSES360_SHARED",
            senderPhoneNumberId: "shared_phone_id",
            fallbackPhoneNumberId: "shared_phone_id",
        });

        const result = await sendSystemAlert("inst_1", "919999999999", "hello");

        expect(result.sent).toBe(true);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/shared_phone_id/messages"),
            expect.any(Object)
        );
    });

    it("uses institute sender and falls back to shared sender on failure", async () => {
        mockWhatsAppIntegrationService.getSenderRouting.mockResolvedValue({
            mode: "INSTITUTE_CUSTOM",
            senderPhoneNumberId: "custom_phone_id",
            fallbackPhoneNumberId: "shared_phone_id",
        });

        (global.fetch as unknown as ReturnType<typeof vi.fn>)
            .mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => ({ error: { message: "sender failed" } }),
            } as Response)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ messages: [{ id: "provider_msg_2" }] }),
            } as Response);

        const result = await sendSystemAlert("inst_2", "919999999999", "hello");

        expect(result.sent).toBe(true);
        expect(mockWhatsAppIntegrationService.markSenderFailure).toHaveBeenCalledWith("inst_2");
        expect(fetch).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining("/custom_phone_id/messages"),
            expect.any(Object)
        );
        expect(fetch).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining("/shared_phone_id/messages"),
            expect.any(Object)
        );
        expect(mockBillingRepo.upsertMonthlyUsage).toHaveBeenCalled();
    });
});
