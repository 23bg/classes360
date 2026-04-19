import crypto from "crypto";
import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";

const STRIPE_API_BASE = "https://api.stripe.com/v1";

export const hasStripeConfig = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PUBLISHABLE_KEY);

export const assertStripeReady = (): void => {
    if (!hasStripeConfig) {
        throw new AppError("Stripe is not configured", 500, "STRIPE_NOT_CONFIGURED");
    }
};

const stripeRequest = async <T>(path: string, body?: URLSearchParams, method: "POST" | "GET" = "POST"): Promise<T> => {
    assertStripeReady();

    const response = await fetch(`${STRIPE_API_BASE}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: method === "GET" ? undefined : body,
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new AppError(`Stripe request failed: ${errorBody}`, response.status, "STRIPE_REQUEST_FAILED");
    }

    return (await response.json()) as T;
};

export const createStripeCheckoutSession = async (input: {
    mode: "subscription" | "payment";
    successUrl: string;
    cancelUrl: string;
    priceId?: string;
    amount?: number;
    currency: string;
    email: string;
    instituteId: string;
    userId?: string;
    planType: string;
    interval: string;
    invoiceId?: string | null;
    couponCode?: string | null;
    couponOriginalAmount?: number | null;
    couponDiscount?: number | null;
    couponFinalAmount?: number | null;
}) => {
    const params = new URLSearchParams();
    params.set("mode", input.mode);
    params.set("success_url", input.successUrl);
    params.set("cancel_url", input.cancelUrl);
    params.set("customer_email", input.email);
    params.set("billing_address_collection", "auto");
    params.set("client_reference_id", input.instituteId);
    params.set("metadata[instituteId]", input.instituteId);
    if (input.userId) {
        params.set("metadata[userId]", input.userId);
    }
    params.set("metadata[planType]", input.planType);
    params.set("metadata[interval]", input.interval);
    params.set("metadata[currency]", input.currency);

    if (input.invoiceId) {
        params.set("metadata[invoiceId]", input.invoiceId);
    }

    if (input.couponCode) {
        params.set("metadata[couponCode]", input.couponCode);
    }
    if (typeof input.couponOriginalAmount === "number") {
        params.set("metadata[couponOriginalAmount]", String(input.couponOriginalAmount));
    }
    if (typeof input.couponDiscount === "number") {
        params.set("metadata[couponDiscount]", String(input.couponDiscount));
    }
    if (typeof input.couponFinalAmount === "number") {
        params.set("metadata[couponFinalAmount]", String(input.couponFinalAmount));
    }

    if (input.mode === "subscription") {
        if (!input.priceId) {
            throw new AppError("Missing Stripe price id", 500, "STRIPE_PRICE_ID_MISSING");
        }

        params.set("line_items[0][price]", input.priceId);
        params.set("line_items[0][quantity]", "1");
        params.set("subscription_data[metadata][instituteId]", input.instituteId);
        if (input.userId) {
            params.set("subscription_data[metadata][userId]", input.userId);
        }
        params.set("subscription_data[metadata][planType]", input.planType);
        params.set("subscription_data[metadata][interval]", input.interval);
        if (input.couponCode) {
            params.set("subscription_data[metadata][couponCode]", input.couponCode);
        }
        if (typeof input.couponDiscount === "number") {
            params.set("subscription_data[metadata][couponDiscount]", String(input.couponDiscount));
        }
        if (typeof input.couponFinalAmount === "number") {
            params.set("subscription_data[metadata][couponFinalAmount]", String(input.couponFinalAmount));
        }
        if (typeof input.couponOriginalAmount === "number") {
            params.set("subscription_data[metadata][couponOriginalAmount]", String(input.couponOriginalAmount));
        }
    } else {
        if (!input.amount) {
            throw new AppError("Missing Stripe amount", 500, "STRIPE_AMOUNT_MISSING");
        }

        params.set("line_items[0][price_data][currency]", input.currency.toLowerCase());
        params.set("line_items[0][price_data][product_data][name]", `${input.planType} subscription payment`);
        params.set("line_items[0][price_data][unit_amount]", String(Math.round(input.amount * 100)));
        params.set("line_items[0][quantity]", "1");
    }

    return stripeRequest<{
        id: string;
        url?: string | null;
        client_secret?: string | null;
        mode: string;
        payment_status?: string | null;
    }>("/checkout/sessions", params);
};

export const retrieveStripeCheckoutSession = async (checkoutSessionId: string) =>
    stripeRequest<{
        id: string;
        payment_status?: string | null;
        subscription?: string | null;
        payment_intent?: string | null;
        client_secret?: string | null;
        metadata?: Record<string, string>;
    }>(`/checkout/sessions/${checkoutSessionId}`, undefined, "GET");

export const verifyStripeWebhookSignature = (payload: string, signature: string): boolean => {
    if (!env.STRIPE_WEBHOOK_SECRET) {
        throw new AppError("Missing STRIPE_WEBHOOK_SECRET", 500, "STRIPE_WEBHOOK_SECRET_MISSING");
    }

    const parts = signature.split(",").reduce<Record<string, string>>((accumulator, part) => {
        const [key, value] = part.split("=");
        if (key && value) {
            accumulator[key.trim()] = value.trim();
        }
        return accumulator;
    }, {});

    const timestamp = parts.t;
    const expectedSignature = parts.v1;

    if (!timestamp || !expectedSignature) {
        return false;
    }

    const signedPayload = `${timestamp}.${payload}`;
    const computed = crypto.createHmac("sha256", env.STRIPE_WEBHOOK_SECRET).update(signedPayload).digest("hex");

    if (computed.length !== expectedSignature.length) {
        return false;
    }

    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(expectedSignature));
};
