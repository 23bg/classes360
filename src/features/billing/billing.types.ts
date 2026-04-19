import type { PlanType } from "@/config/plans";
import type { BillingInterval } from "@/features/subscription/subscriptionApi";

export type BillingProviderKey = "RAZORPAY" | "STRIPE";

export type BillingRegion = "IN" | "GLOBAL" | "UNKNOWN";

export type BillingCheckoutMethod = "CARD" | "UPI" | "NETBANKING" | "APPLE_PAY" | "GOOGLE_PAY" | "PAYPAL";

export type BillingCheckoutMode = "subscription" | "payment";

export type BillingCheckoutInput = {
    instituteId: string;
    userId: string;
    email: string;
    provider: BillingProviderKey;
    country?: string | null;
    planType: PlanType;
    interval: BillingInterval;
    currency: string;
    amount: number;
    taxes: number;
    totalAmount: number;
    description: string;
    successUrl: string;
    cancelUrl: string;
    invoiceId?: string | null;
    existingSubscriptionId?: string | null;
    couponCode?: string | null;
    couponOriginalAmount?: number | null;
    couponDiscount?: number | null;
    couponFinalAmount?: number | null;
};

export type BillingCheckoutSession = {
    provider: BillingProviderKey;
    region: BillingRegion;
    checkoutMode: BillingCheckoutMode;
    planType: PlanType;
    interval: BillingInterval;
    currency: string;
    amount: number;
    taxes: number;
    totalAmount: number;
    couponCode?: string | null;
    couponOriginalAmount?: number | null;
    couponDiscount?: number | null;
    couponFinalAmount?: number | null;
    checkoutSessionId?: string | null;
    providerSubscriptionId?: string | null;
    providerPaymentId?: string | null;
    providerPaymentLinkId?: string | null;
    checkoutUrl?: string | null;
    clientSecret?: string | null;
    publishableKey?: string | null;
    paymentMethods: BillingCheckoutMethod[];
    redirectRequired: boolean;
    regionLabel: string;
};

export type BillingVerificationInput = {
    instituteId: string;
    userId: string;
    provider: BillingProviderKey;
    paymentId?: string;
    subscriptionId?: string;
    signature?: string;
    checkoutSessionId?: string;
    invoiceId?: string | null;
};

export type BillingVerificationResult = {
    verified: boolean;
    provider: BillingProviderKey;
    providerPaymentId?: string | null;
    providerSubscriptionId?: string | null;
    providerPaymentLinkId?: string | null;
    transactionId?: string | null;
    subscriptionId?: string | null;
    status: "VERIFIED" | "PENDING" | "FAILED";
};

export type BillingWebhookInput = {
    rawBody: string;
    headers: Headers;
};

export type BillingWebhookResult = {
    provider: BillingProviderKey;
    event: string;
    processed: boolean;
    webhookEventId?: string | null;
    providerPaymentId?: string | null;
    providerSubscriptionId?: string | null;
    providerPaymentLinkId?: string | null;
    transactionId?: string | null;
    subscriptionId?: string | null;
};

export interface BillingProvider {
    readonly key: BillingProviderKey;

    createSubscription(input: BillingCheckoutInput): Promise<BillingCheckoutSession>;

    createCheckoutSession(input: BillingCheckoutInput): Promise<BillingCheckoutSession>;

    verifyPayment(input: BillingVerificationInput): Promise<BillingVerificationResult>;

    handleWebhook(input: BillingWebhookInput): Promise<BillingWebhookResult>;
}
