import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockBillingRepo, mockSubscriptionService } = vi.hoisted(() => ({
    mockBillingRepo: {
        countOutboundAlertsInWindow: vi.fn(),
        upsertInvoice: vi.fn(),
        listInvoices: vi.fn(),
        hasOverdueInvoice: vi.fn(),
        hasExhaustedPendingInvoice: vi.fn(),
        findInvoiceById: vi.fn(),
        attachPaymentLink: vi.fn(),
        recordAutopayAttempt: vi.fn(),
        listPendingRetryInvoices: vi.fn(),
        markInvoicePaidByPaymentLinkId: vi.fn(),
        markOverdueInvoices: vi.fn(),
        upsertMonthlyUsage: vi.fn(),
    },
    mockSubscriptionService: {
        getSubscription: vi.fn(),
        getBillingSummary: vi.fn(),
    },
}));

vi.mock("@/features/billing/repositories/billing.repo", () => ({
    billingRepository: mockBillingRepo,
}));

vi.mock("@/features/subscription/services/subscription.service", () => ({
    subscriptionService: mockSubscriptionService,
}));

vi.mock("@/lib/billing/razorpay", () => ({
    assertRazorpayReady: vi.fn(),
    razorpay: {
        paymentLink: {
            create: vi.fn(),
        },
    },
}));

import { billingService } from "@/features/billing/services/billing.service";

describe("billingService usage limits", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockBillingRepo.hasOverdueInvoice.mockResolvedValue(false);
        mockBillingRepo.hasExhaustedPendingInvoice.mockResolvedValue(false);
        mockSubscriptionService.getBillingSummary.mockResolvedValue({});
    });

    it("Growth plan: 2500 alerts has no overage", async () => {
        mockSubscriptionService.getSubscription.mockResolvedValue({
            instituteId: "inst1",
            status: "ACTIVE",
            planType: "GROWTH",
            userLimit: 10,
            trialEndsAt: null,
            autopayEnabled: true,
            paymentMethodAddedAt: new Date(),
        });
        mockBillingRepo.countOutboundAlertsInWindow.mockResolvedValue(2500);

        const result = await billingService.getUsageSnapshot("inst1");

        expect(result.alertsIncluded).toBe(3000);
        expect(result.extraAlerts).toBe(0);
        expect(result.estimatedUsageCost).toBe(0);
    });

    it("Growth plan: 3500 alerts charges overage for 500", async () => {
        mockSubscriptionService.getSubscription.mockResolvedValue({
            instituteId: "inst1",
            status: "ACTIVE",
            planType: "GROWTH",
            userLimit: 10,
            trialEndsAt: null,
            autopayEnabled: true,
            paymentMethodAddedAt: new Date(),
        });
        mockBillingRepo.countOutboundAlertsInWindow.mockResolvedValue(3500);

        const result = await billingService.getUsageSnapshot("inst1");

        expect(result.alertsIncluded).toBe(3000);
        expect(result.extraAlerts).toBe(500);
        expect(result.estimatedUsageCost).toBe(300);
    });

    it("Scale plan: 9000 alerts has no overage", async () => {
        mockSubscriptionService.getSubscription.mockResolvedValue({
            instituteId: "inst1",
            status: "ACTIVE",
            planType: "SCALE",
            userLimit: 0,
            trialEndsAt: null,
            autopayEnabled: true,
            paymentMethodAddedAt: new Date(),
        });
        mockBillingRepo.countOutboundAlertsInWindow.mockResolvedValue(9000);

        const result = await billingService.getUsageSnapshot("inst1");

        expect(result.alertsIncluded).toBe(10000);
        expect(result.extraAlerts).toBe(0);
        expect(result.estimatedUsageCost).toBe(0);
    });

    it("Scale plan: 12000 alerts charges overage for 2000", async () => {
        mockSubscriptionService.getSubscription.mockResolvedValue({
            instituteId: "inst1",
            status: "ACTIVE",
            planType: "SCALE",
            userLimit: 0,
            trialEndsAt: null,
            autopayEnabled: true,
            paymentMethodAddedAt: new Date(),
        });
        mockBillingRepo.countOutboundAlertsInWindow.mockResolvedValue(12000);

        const result = await billingService.getUsageSnapshot("inst1");

        expect(result.alertsIncluded).toBe(10000);
        expect(result.extraAlerts).toBe(2000);
        expect(result.estimatedUsageCost).toBe(1000);
    });

    it("monthly invoice uses updated Growth included limit", async () => {
        const runAt = new Date("2026-04-03T00:00:00.000Z");
        mockSubscriptionService.getSubscription.mockResolvedValue({
            instituteId: "inst1",
            status: "ACTIVE",
            planType: "GROWTH",
            userLimit: 10,
            trialEndsAt: null,
            billingInterval: "MONTHLY",
            autopayEnabled: false,
            paymentMethodAddedAt: null,
        });
        mockBillingRepo.countOutboundAlertsInWindow.mockResolvedValue(3500);
        mockBillingRepo.upsertInvoice.mockResolvedValue({ id: "inv1", totalAmount: 2299 });

        const createPaymentLinkSpy = vi.spyOn(billingService, "createPaymentLinkForInvoice").mockResolvedValue({} as never);
        const attemptAutopaySpy = vi.spyOn(billingService, "attemptAutopayForInvoice").mockResolvedValue({} as never);

        await billingService.createOrUpdateClosedMonthInvoice("inst1", runAt);

        expect(mockBillingRepo.upsertInvoice).toHaveBeenCalledWith(
            expect.objectContaining({
                includedAlerts: 3000,
                extraAlerts: 500,
                usageCharge: 300,
                planCharge: 1999,
            })
        );

        createPaymentLinkSpy.mockRestore();
        attemptAutopaySpy.mockRestore();
    });
});
