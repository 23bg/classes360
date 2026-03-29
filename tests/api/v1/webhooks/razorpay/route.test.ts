import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/v1/webhooks/razorpay/route";

const { mockVerifySignature, mockSubscriptionService } = vi.hoisted(() => ({
    mockVerifySignature: vi.fn(),
    mockSubscriptionService: {
        handleWebhookEvent: vi.fn(),
    },
}));

vi.mock("@/lib/billing/razorpay", () => ({
    verifyRazorpayWebhookSignature: mockVerifySignature,
}));

vi.mock("@/features/subscription/services/subscription.service", () => ({
    subscriptionService: mockSubscriptionService,
}));

describe("POST /api/v1/webhooks/razorpay", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("rejects webhook without signature", async () => {
        const request = new Request("http://localhost/api/v1/webhooks/razorpay", {
            method: "POST",
            body: JSON.stringify({ event: "subscription.activated" }),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("MISSING_SIGNATURE");
    });

    it("rejects webhook with invalid signature", async () => {
        mockVerifySignature.mockReturnValue(false);
        const payload = JSON.stringify({ event: "subscription.activated" });

        const request = new Request("http://localhost/api/v1/webhooks/razorpay", {
            method: "POST",
            headers: { "x-razorpay-signature": "invalid" },
            body: payload,
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(401);
        expect(body.success).toBe(false);
        expect(body.error.code).toBe("INVALID_SIGNATURE");
    });

    it("accepts valid webhook and forwards parsed data", async () => {
        mockVerifySignature.mockReturnValue(true);

        const payload = {
            event: "subscription.activated",
            payload: {
                subscription: {
                    entity: {
                        id: "sub_123",
                        current_end: 1767187200,
                        notes: {
                            instituteId: "inst1",
                        },
                    },
                },
            },
        };

        const request = new Request("http://localhost/api/v1/webhooks/razorpay", {
            method: "POST",
            headers: { "x-razorpay-signature": "valid" },
            body: JSON.stringify(payload),
        });

        const response = await POST(request as never);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.success).toBe(true);
        expect(mockSubscriptionService.handleWebhookEvent).toHaveBeenCalledWith({
            event: "subscription.activated",
            instituteId: "inst1",
            razorpaySubId: "sub_123",
            currentPeriodEnd: expect.any(Date),
        });
    });
});

