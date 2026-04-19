import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";
import { assertStripeReady, createStripeCheckoutSession, retrieveStripeCheckoutSession, verifyStripeWebhookSignature } from "@/lib/billing/stripe";
import { detectBillingRegion, getRegionLabel } from "@/features/billing/billingRouting";
import { couponService } from "@/features/billing/services/coupon.service";
import { couponRepository } from "@/features/billing/repositories/coupon.repo";
import type { BillingCheckoutInput, BillingCheckoutSession, BillingProvider, BillingVerificationInput, BillingVerificationResult, BillingWebhookInput, BillingWebhookResult } from "@/features/billing/billing.types";
import { billingWebhookEventRepository } from "@/features/billing/webhookEventDataApi";
import { subscriptionTransactionRepository } from "@/features/billing/subscriptionTransactionDataApi";
import { subscriptionRepository } from "@/features/subscription/repositories/subscription.repo";
import { billingRepository } from "@/features/billing/repositories/billing.repo";

const paymentMethods = ["CARD", "APPLE_PAY", "GOOGLE_PAY", "PAYPAL"] as const;

const getStripePriceId = (planType: string, interval: string) => {
    const lookup: Record<string, Record<string, string | undefined>> = {
        STARTER: {
            MONTHLY: env.STRIPE_PRICE_ID_STARTER_MONTHLY,
            YEARLY: env.STRIPE_PRICE_ID_STARTER_YEARLY,
        },
        TEAM: {
            MONTHLY: env.STRIPE_PRICE_ID_TEAM_MONTHLY,
            YEARLY: env.STRIPE_PRICE_ID_TEAM_YEARLY,
        },
        GROWTH: {
            MONTHLY: env.STRIPE_PRICE_ID_GROWTH_MONTHLY,
            YEARLY: env.STRIPE_PRICE_ID_GROWTH_YEARLY,
        },
        SCALE: {
            MONTHLY: env.STRIPE_PRICE_ID_SCALE_MONTHLY,
            YEARLY: env.STRIPE_PRICE_ID_SCALE_YEARLY,
        },
    };

    const priceId = lookup[planType]?.[interval];
    if (!priceId) {
        throw new AppError(`Missing Stripe price id for ${planType}/${interval}`, 500, "STRIPE_PRICE_ID_MISSING");
    }

    return priceId;
};

const toSession = (input: BillingCheckoutInput, session: { id: string; url?: string | null; client_secret?: string | null; payment_status?: string | null }): BillingCheckoutSession => ({
    provider: "STRIPE",
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
    checkoutSessionId: session.id,
    checkoutUrl: session.url ?? null,
    clientSecret: session.client_secret ?? null,
    publishableKey: env.STRIPE_PUBLISHABLE_KEY ?? null,
    paymentMethods: [...paymentMethods],
    redirectRequired: true,
    regionLabel: getRegionLabel(detectBillingRegion(input.country)),
});

export const stripeProvider: BillingProvider = {
    key: "STRIPE",

    async createSubscription(input: BillingCheckoutInput) {
        assertStripeReady();
        const priceId = getStripePriceId(input.planType, input.interval);
        const session = await createStripeCheckoutSession({
            mode: "subscription",
            successUrl: input.successUrl,
            cancelUrl: input.cancelUrl,
            priceId,
            currency: input.currency,
            email: input.email,
            instituteId: input.instituteId,
            planType: input.planType,
            interval: input.interval,
            invoiceId: input.invoiceId,
            couponCode: input.couponCode,
            couponDiscount: input.couponDiscount,
            couponFinalAmount: input.couponFinalAmount,
            couponOriginalAmount: input.couponOriginalAmount,
            userId: input.userId,
        });

        return toSession(input, session);
    },

    async createCheckoutSession(input: BillingCheckoutInput) {
        if (input.invoiceId) {
            const session = await createStripeCheckoutSession({
                mode: "payment",
                successUrl: input.successUrl,
                cancelUrl: input.cancelUrl,
                amount: input.totalAmount,
                currency: input.currency,
                email: input.email,
                instituteId: input.instituteId,
                planType: input.planType,
                interval: input.interval,
                invoiceId: input.invoiceId,
                couponCode: input.couponCode,
                couponDiscount: input.couponDiscount,
                couponFinalAmount: input.couponFinalAmount,
                couponOriginalAmount: input.couponOriginalAmount,
                userId: input.userId,
            });

            return toSession(input, session);
        }

        return this.createSubscription(input);
    },

    async verifyPayment(input: BillingVerificationInput): Promise<BillingVerificationResult> {
        if (!input.checkoutSessionId) {
            return {
                verified: false,
                provider: "STRIPE",
                status: "PENDING",
            };
        }

        const session = await retrieveStripeCheckoutSession(input.checkoutSessionId);
        const verified = session.payment_status === "paid" || session.payment_intent !== null;

        if (!verified) {
            return {
                verified: false,
                provider: "STRIPE",
                status: "PENDING",
            };
        }

        return {
            verified: true,
            provider: "STRIPE",
            providerSubscriptionId: session.subscription ?? null,
            providerPaymentId: session.payment_intent ?? null,
            status: "VERIFIED",
        };
    },

    async handleWebhook(input: BillingWebhookInput): Promise<BillingWebhookResult> {
        const signature = input.headers.get("stripe-signature");
        if (!signature || !verifyStripeWebhookSignature(input.rawBody, signature)) {
            throw new AppError("Invalid Stripe webhook signature", 401, "INVALID_STRIPE_WEBHOOK_SIGNATURE");
        }

        const payload = JSON.parse(input.rawBody) as {
            id: string;
            type: string;
            data?: {
                object?: {
                    id?: string;
                    customer?: string;
                    subscription?: string | null;
                    payment_intent?: string | null;
                    status?: string;
                    metadata?: Record<string, string>;
                };
            };
        };

        const event = payload.type ?? "";
        const eventId = payload.id;
        const object = payload.data?.object;
        const instituteId = object?.metadata?.instituteId;
        const providerPaymentId = object?.payment_intent ?? object?.id ?? null;
        const providerSubscriptionId = object?.subscription ?? null;

        const existing = await billingWebhookEventRepository.hasProcessed("STRIPE", eventId);
        if (existing) {
            return {
                provider: "STRIPE",
                event,
                processed: false,
                webhookEventId: eventId,
                providerPaymentId,
                providerSubscriptionId,
            };
        }

        await billingWebhookEventRepository.record({
            provider: "STRIPE",
            providerEventId: eventId,
            eventType: event,
            instituteId,
            providerPaymentId,
            providerSubscriptionId,
            payload: JSON.parse(input.rawBody) as Record<string, unknown>,
        });

        if (!instituteId) {
            return {
                provider: "STRIPE",
                event,
                processed: true,
                webhookEventId: eventId,
                providerPaymentId,
                providerSubscriptionId,
            };
        }

        const subscription = await subscriptionRepository.findByInstituteId(instituteId);
        const currentPeriodEnd = null;
        const currentPeriodStart = null;

        if (event === "checkout.session.completed" || event === "invoice.paid") {
            const invoiceId = object?.metadata?.invoiceId;
            const couponCode = object?.metadata?.couponCode;
            const couponUserId = object?.metadata?.userId;

            if (invoiceId) {
                await billingRepository.markInvoicePaidById(invoiceId).catch(() => undefined);
            }

            if (couponCode) {
                const coupon = await couponRepository.findByCode(couponCode);
                if (coupon) {
                    await couponService.recordUsageForCoupon(coupon.id, couponUserId ?? null, providerPaymentId ?? object?.id ?? null);
                }
            }

            const updated = await subscriptionRepository.updateByInstituteId(instituteId, {
                billingProvider: "STRIPE",
                providerSubscriptionId: providerSubscriptionId ?? null,
                providerPaymentId,
                status: "ACTIVE",
                currentPeriodStart,
                currentPeriodEnd,
                lastChargedAt: new Date(),
                autopayEnabled: true,
                paymentMethodAddedAt: new Date(),
                currency: object?.metadata?.currency ?? "USD",
            } as any);

            const transaction = await subscriptionTransactionRepository.create({
                instituteId,
                provider: "STRIPE",
                providerPaymentId,
                providerSubscriptionId,
                providerEventId: eventId,
                subscriptionId: updated.id,
                amount: 0,
                currency: object?.metadata?.currency ?? "USD",
                status: "SUCCEEDED",
                startDate: currentPeriodStart,
                endDate: currentPeriodEnd,
                metadata: { event, checkoutSessionId: object?.id ?? null },
            });

            return {
                provider: "STRIPE",
                event,
                processed: true,
                webhookEventId: eventId,
                providerPaymentId,
                providerSubscriptionId,
                transactionId: transaction.id,
                subscriptionId: updated.id,
            };
        }

        if (event === "invoice.payment_failed") {
            const invoiceId = object?.metadata?.invoiceId;
            if (invoiceId) {
                await billingRepository.findInvoiceById(invoiceId).catch(() => undefined);
            }

            await subscriptionRepository.updateByInstituteId(instituteId, {
                billingProvider: "STRIPE",
                providerSubscriptionId: providerSubscriptionId ?? null,
                providerPaymentId,
                status: "PAST_DUE",
                autopayEnabled: false,
            } as any);
        }

        return {
            provider: "STRIPE",
            event,
            processed: true,
            webhookEventId: eventId,
            providerPaymentId,
            providerSubscriptionId,
        };
    },
};
