import { env } from "@/lib/config/env";
import { assertRazorpayReady, razorpay, verifyRazorpayCheckoutSignature, verifyRazorpayWebhookSignature } from "@/lib/billing/razorpay";
import { AppError } from "@/lib/utils/error";
import { detectBillingRegion, getRegionLabel } from "@/features/billing/billingRouting";
import { couponService } from "@/features/billing/services/coupon.service";
import { couponRepository } from "@/features/billing/repositories/coupon.repo";
import type { BillingCheckoutInput, BillingCheckoutSession, BillingProvider, BillingVerificationInput, BillingVerificationResult, BillingWebhookInput, BillingWebhookResult } from "@/features/billing/billing.types";
import { billingWebhookEventRepository } from "@/features/billing/webhookEventDataApi";
import { subscriptionTransactionRepository } from "@/features/billing/subscriptionTransactionDataApi";
import { subscriptionRepository } from "@/features/subscription/repositories/subscription.repo";
import { billingRepository } from "@/features/billing/repositories/billing.repo";

const paymentMethods = ["CARD", "UPI", "NETBANKING"] as const;

const getRazorpayPlanId = (planType: string, interval: string) => {
    const lookup: Record<string, Record<string, string | undefined>> = {
        STARTER: {
            MONTHLY: env.RAZORPAY_PLAN_ID_STARTER_MONTHLY,
            YEARLY: env.RAZORPAY_PLAN_ID_STARTER_YEARLY,
        },
        TEAM: {
            MONTHLY: env.RAZORPAY_PLAN_ID_TEAM_MONTHLY ?? env.RAZORPAY_PLAN_ID_GROWTH_MONTHLY,
            YEARLY: env.RAZORPAY_PLAN_ID_TEAM_YEARLY ?? env.RAZORPAY_PLAN_ID_GROWTH_YEARLY,
        },
        GROWTH: {
            MONTHLY: env.RAZORPAY_PLAN_ID_GROWTH_MONTHLY,
            YEARLY: env.RAZORPAY_PLAN_ID_GROWTH_YEARLY,
        },
        SCALE: {
            MONTHLY: env.RAZORPAY_PLAN_ID_SCALE_MONTHLY,
            YEARLY: env.RAZORPAY_PLAN_ID_SCALE_YEARLY,
        },
    };

    const planId = lookup[planType]?.[interval];
    if (!planId) {
        throw new AppError(`Missing Razorpay plan id for ${planType}/${interval}`, 500, "RAZORPAY_PLAN_ID_MISSING");
    }

    return planId;
};

const normalizeSession = (input: BillingCheckoutInput, providerSubscriptionId: string, checkoutUrl?: string | null): BillingCheckoutSession => ({
    provider: "RAZORPAY",
    region: detectBillingRegion(input.country),
    checkoutMode: input.invoiceId ? "payment" : "subscription",
    planType: input.planType,
    interval: input.interval,
    currency: input.currency,
    amount: input.amount,
    taxes: input.taxes,
    totalAmount: input.totalAmount,
    couponCode: input.couponCode ?? null,
    couponOriginalAmount: input.couponOriginalAmount ?? null,
    couponDiscount: input.couponDiscount ?? null,
    couponFinalAmount: input.couponFinalAmount ?? null,
    providerSubscriptionId,
    checkoutUrl: checkoutUrl ?? null,
    publishableKey: env.RAZORPAY_KEY_ID ?? null,
    paymentMethods: [...paymentMethods],
    redirectRequired: false,
    regionLabel: getRegionLabel(detectBillingRegion(input.country)),
});

export const razorpayProvider: BillingProvider = {
    key: "RAZORPAY",

    async createSubscription(input: BillingCheckoutInput) {
        assertRazorpayReady();
        const planId = getRazorpayPlanId(input.planType, input.interval);

        const notes: Record<string, string> = {
            instituteId: input.instituteId,
            planType: input.planType,
            interval: input.interval,
            invoiceId: input.invoiceId ?? "",
        };

        if (input.couponCode) {
            notes.couponCode = input.couponCode;
        }
        if (input.couponDiscount != null) {
            notes.discountAmount = String(input.couponDiscount);
        }
        if (input.couponFinalAmount != null) {
            notes.finalAmount = String(input.couponFinalAmount);
        }

        const created = await razorpay!.subscriptions.create({
            plan_id: planId,
            quantity: 1,
            total_count: 12,
            customer_notify: 1,
            notes,
        });

        return normalizeSession(input, created.id, null);
    },

    async createCheckoutSession(input: BillingCheckoutInput) {
        const created = await this.createSubscription(input);
        return created;
    },

    async verifyPayment(input: BillingVerificationInput): Promise<BillingVerificationResult> {
        if (!input.paymentId || !input.subscriptionId || !input.signature) {
            return {
                verified: false,
                provider: "RAZORPAY",
                status: "FAILED",
            };
        }

        const verified = verifyRazorpayCheckoutSignature({
            paymentId: input.paymentId,
            subscriptionId: input.subscriptionId,
            signature: input.signature,
        });

        if (!verified) {
            return {
                verified: false,
                provider: "RAZORPAY",
                providerPaymentId: input.paymentId,
                providerSubscriptionId: input.subscriptionId,
                status: "FAILED",
            };
        }

        const subscription = await subscriptionRepository.findByInstituteId(input.instituteId);
        return {
            verified: true,
            provider: "RAZORPAY",
            providerPaymentId: input.paymentId,
            providerSubscriptionId: input.subscriptionId,
            subscriptionId: subscription?.id ?? null,
            status: "VERIFIED",
        };
    },

    async handleWebhook(input: BillingWebhookInput): Promise<BillingWebhookResult> {
        const signature = input.headers.get("x-razorpay-signature");
        if (!signature || !verifyRazorpayWebhookSignature(input.rawBody, signature)) {
            throw new AppError("Invalid Razorpay webhook signature", 401, "INVALID_RAZORPAY_WEBHOOK_SIGNATURE");
        }

        const payload = JSON.parse(input.rawBody) as {
            event?: string;
            payload?: {
                payment?: { entity?: { id?: string; order_id?: string; notes?: Record<string, string> } };
                subscription?: { entity?: { id?: string; notes?: Record<string, string>; current_end?: number; current_start?: number } };
                payment_link?: { entity?: { id?: string; notes?: Record<string, string> } };
            };
        };

        const event = payload.event ?? "";
        const subscriptionEntity = payload.payload?.subscription?.entity;
        const paymentEntity = payload.payload?.payment?.entity;
        const paymentLinkEntity = payload.payload?.payment_link?.entity;
        const instituteId = subscriptionEntity?.notes?.instituteId ?? paymentEntity?.notes?.instituteId ?? paymentLinkEntity?.notes?.instituteId;
        const providerSubscriptionId = subscriptionEntity?.id ?? paymentEntity?.notes?.razorpay_subscription_id ?? paymentEntity?.order_id ?? null;
        const providerPaymentId = paymentEntity?.id ?? null;
        const providerPaymentLinkId = paymentLinkEntity?.id ?? null;
        const webhookEventId = `${event}:${providerSubscriptionId ?? providerPaymentId ?? providerPaymentLinkId ?? "unknown"}`;

        const existing = await billingWebhookEventRepository.hasProcessed("RAZORPAY", webhookEventId);
        if (existing) {
            return {
                provider: "RAZORPAY",
                event,
                processed: false,
                webhookEventId,
                providerPaymentId,
                providerSubscriptionId,
            };
        }

        await billingWebhookEventRepository.record({
            provider: "RAZORPAY",
            providerEventId: webhookEventId,
            eventType: event,
            instituteId,
            providerPaymentId,
            providerSubscriptionId,
            payload: JSON.parse(input.rawBody) as Record<string, unknown>,
        });

        if (event === "payment_link.paid" && providerPaymentLinkId) {
            const invoiceId = payload.payload?.payment_link?.entity?.notes?.invoiceId;
            const couponCode = payload.payload?.payment_link?.entity?.notes?.couponCode;
            const couponUserId = payload.payload?.payment_link?.entity?.notes?.userId;

            if (invoiceId) {
                await billingRepository.markInvoicePaidById(invoiceId).catch(() => undefined);

                if (couponCode) {
                    const coupon = await couponRepository.findByCode(couponCode);
                    if (coupon) {
                        await couponService.recordUsageForCoupon(coupon.id, couponUserId ?? null, providerPaymentLinkId);
                    }
                }

                const transaction = await subscriptionTransactionRepository.create({
                    instituteId: instituteId ?? "",
                    provider: "RAZORPAY",
                    providerPaymentId,
                    providerSubscriptionId,
                    providerEventId: webhookEventId,
                    amount: 0,
                    currency: "INR",
                    status: "SUCCEEDED",
                    metadata: { invoiceId, paymentLinkId: providerPaymentLinkId, event },
                });

                return {
                    provider: "RAZORPAY",
                    event,
                    processed: true,
                    webhookEventId,
                    providerPaymentId,
                    providerSubscriptionId,
                    providerPaymentLinkId,
                    transactionId: transaction.id,
                };
            }
        }

        if (!instituteId) {
            return {
                provider: "RAZORPAY",
                event,
                processed: true,
                webhookEventId,
                providerPaymentId,
                providerSubscriptionId,
            };
        }

        const nextStatus = event === "payment.failed" || event === "subscription.cancelled" ? "INACTIVE" : "ACTIVE";
        const currentPeriodEnd = subscriptionEntity?.current_end ? new Date(subscriptionEntity.current_end * 1000) : null;
        const currentPeriodStart = subscriptionEntity?.current_start ? new Date(subscriptionEntity.current_start * 1000) : null;

        const subscription = await subscriptionRepository.upsertByRazorpaySubId(providerSubscriptionId ?? webhookEventId, instituteId, {
            status: nextStatus,
            currentPeriodEnd,
            currentPeriodStart,
            lastChargedAt: event === "subscription.charged" || event === "payment.captured" ? new Date() : undefined,
            billingInterval: undefined,
            autopayEnabled: event !== "payment.failed",
            paymentMethodAddedAt: event === "payment.captured" || event === "subscription.charged" ? new Date() : undefined,
        });

        const transaction = await subscriptionTransactionRepository.create({
            instituteId,
            provider: "RAZORPAY",
            providerPaymentId,
            providerSubscriptionId,
            providerEventId: webhookEventId,
            subscriptionId: subscription.id,
            amount: 0,
            currency: "INR",
            status: nextStatus === "ACTIVE" ? "SUCCEEDED" : "FAILED",
            startDate: currentPeriodStart,
            endDate: currentPeriodEnd,
            metadata: { event, providerSubscriptionId, providerPaymentId },
        });

        return {
            provider: "RAZORPAY",
            event,
            processed: true,
            webhookEventId,
            providerPaymentId,
            providerSubscriptionId,
            transactionId: transaction.id,
            subscriptionId: subscription.id,
        };
    },
};
