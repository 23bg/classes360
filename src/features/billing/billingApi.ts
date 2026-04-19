import { getPlanPricing, isGrandfatheredSubscription, PLAN_CONFIG, PlanType } from "@/config/plans";
import { billingRepository } from "@/features/billing/repositories/billing.repo";
import { couponRepository } from "@/features/billing/repositories/coupon.repo";
import { couponService } from "@/features/billing/services/coupon.service";
import { detectBillingRegion, getRegionLabel, resolveBillingProvider } from "@/features/billing/billingRouting";
import { getBillingProvider } from "@/features/billing/providers";
import { subscriptionTransactionRepository } from "@/features/billing/subscriptionTransactionDataApi";
import { subscriptionRepository } from "@/features/subscription/repositories/subscription.repo";
import { subscriptionService } from "@/features/subscription/services/subscription.service";
import { assertRazorpayReady, razorpay } from "@/lib/billing/razorpay";
import { AppError } from "@/lib/utils/error";
import { whatsappIntegrationService } from "@/features/whatsapp/whatsappApi";
import { instituteRepository } from "@/features/institute/instituteDataApi";
import { env } from "@/lib/config/env";
import type { BillingCheckoutSession, BillingProviderKey } from "@/features/billing/billing.types";

type BillingPeriod = {
    month: number;
    year: number;
    periodStart: Date;
    periodEnd: Date;
};

const toStoredPlanType = (storedPlanType: string | null | undefined, userLimit?: number | null): PlanType => {
    if (storedPlanType === "STARTER" || storedPlanType === "GROWTH" || storedPlanType === "SCALE") {
        return storedPlanType;
    }

    if (storedPlanType === "SOLO") {
        return "STARTER";
    }

    if (storedPlanType === "TEAM") {
        const normalizedLimit = userLimit ?? 0;

        if (normalizedLimit === 0) {
            return "SCALE";
        }

        if (normalizedLimit <= (PLAN_CONFIG.TEAM.userLimit ?? 5)) {
            return "TEAM";
        }

        if (normalizedLimit <= (PLAN_CONFIG.GROWTH.userLimit ?? 20)) {
            return "GROWTH";
        }

        return "SCALE";
    }

    return "STARTER";
};

const getCurrentMonthWindow = (now = new Date()) => {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    return { start, end };
};

const getClosedBillingPeriod = (runAt = new Date()): BillingPeriod => {
    const monthStart = new Date(Date.UTC(runAt.getUTCFullYear(), runAt.getUTCMonth(), 1, 0, 0, 0, 0));
    const periodStart = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1, 0, 0, 0, 0));
    const periodEnd = monthStart;

    return {
        month: periodStart.getUTCMonth() + 1,
        year: periodStart.getUTCFullYear(),
        periodStart,
        periodEnd,
    };
};

const getDueDate = (runAt = new Date()) => new Date(Date.UTC(runAt.getUTCFullYear(), runAt.getUTCMonth(), 10, 23, 59, 59, 999));

const round2 = (n: number) => Math.round(n * 100) / 100;
const RETRY_DAY_OFFSETS = [0, 1, 3, 5];

const INTERNATIONAL_PRICING_USD: Record<PlanType, { monthly: number; yearly: number }> = {
    STARTER: { monthly: 12, yearly: 120 },
    TEAM: { monthly: 24, yearly: 240 },
    GROWTH: { monthly: 42, yearly: 420 },
    SCALE: { monthly: 60, yearly: 600 },
};

const getBaseUrl = () => env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const getTaxRate = (region: "IN" | "GLOBAL" | "UNKNOWN") => (region === "IN" ? 0.18 : 0);

const getQuotedPrice = (planType: PlanType, interval: "MONTHLY" | "YEARLY", region: "IN" | "GLOBAL" | "UNKNOWN") => {
    if (region === "GLOBAL") {
        return INTERNATIONAL_PRICING_USD[planType][interval === "YEARLY" ? "yearly" : "monthly"];
    }

    const pricing = getPlanPricing(planType, {
        grandfathered: false,
        version: "CURRENT",
    });

    return interval === "YEARLY" ? pricing.yearly : pricing.monthly;
};

const buildCheckoutSession = (input: {
    provider: BillingProviderKey;
    region: "IN" | "GLOBAL" | "UNKNOWN";
    planType: PlanType;
    interval: "MONTHLY" | "YEARLY";
    currency: string;
    amount: number;
    taxes: number;
    totalAmount: number;
    providerCheckout: BillingCheckoutSession;
}): BillingCheckoutSession => ({
    ...input.providerCheckout,
    provider: input.provider,
    region: input.region,
    planType: input.planType,
    interval: input.interval,
    currency: input.currency,
    amount: input.amount,
    taxes: input.taxes,
    totalAmount: input.totalAmount,
});

const addDaysUtc = (value: Date, offsetDays: number) =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() + offsetDays, value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds(), value.getUTCMilliseconds()));

export const billingService = {
    async getCheckoutContext(instituteId: string, requestedProvider?: BillingProviderKey | null) {
        const [subscription, institute] = await Promise.all([
            subscriptionService.getSubscription(instituteId),
            instituteRepository.findById(instituteId),
        ]);

        const country = institute?.address?.country ?? null;
        const region = detectBillingRegion(country);
        const recommendedProvider = resolveBillingProvider(country, requestedProvider ?? null);
        const provider = recommendedProvider ?? "RAZORPAY";
        const currency = region === "GLOBAL" ? "USD" : "INR";

        return {
            subscription,
            institute,
            country,
            region,
            regionLabel: getRegionLabel(region),
            provider,
            recommendedProvider,
            currency,
            taxRate: getTaxRate(region),
            allowedProviders: region === "UNKNOWN" ? (["RAZORPAY", "STRIPE"] as BillingProviderKey[]) : [provider],
        };
    },

    async createCheckoutSession(input: {
        instituteId: string;
        userId: string;
        email: string;
        planType: PlanType;
        interval: "MONTHLY" | "YEARLY";
        provider?: BillingProviderKey | null;
        invoiceId?: string | null;
        couponCode?: string | null;
    }) {
        const context = await this.getCheckoutContext(input.instituteId, input.provider ?? null);
        const provider = input.provider ?? context.provider;
        const providerImpl = getBillingProvider(provider);

        const invoice = input.invoiceId ? await billingRepository.findInvoiceById(input.invoiceId) : null;
        const quotedAmount = invoice ? invoice.totalAmount : getQuotedPrice(input.planType, input.interval, context.region);

        let amount = quotedAmount;
        let taxes = invoice ? 0 : round2(amount * context.taxRate);
        let totalAmount = invoice ? quotedAmount : round2(amount + taxes);
        let couponOriginalAmount: number | null = invoice?.originalAmount ?? null;
        let couponDiscount: number | null = invoice?.discountAmount ?? null;
        let couponFinalAmount: number | null = invoice?.finalAmount ?? null;

        if (input.couponCode && !invoice) {
            const validation = await couponService.validateCoupon({
                instituteId: input.instituteId,
                userId: input.userId,
                code: input.couponCode,
                plan: input.planType,
                billingCycle: input.interval,
                currency: context.currency as "INR" | "USD",
                amount,
            });

            if (!validation.valid || !validation.coupon) {
                throw new AppError(validation.reason ?? "Coupon validation failed", 400, "INVALID_COUPON");
            }

            const calculation = couponService.calculateDiscount({ amount, coupon: validation.coupon });
            couponOriginalAmount = amount;
            couponDiscount = calculation.discount;
            couponFinalAmount = calculation.finalAmount;
            amount = calculation.finalAmount;
            taxes = round2(amount * context.taxRate);
            totalAmount = round2(amount + taxes);
        }

        const successUrl = provider === "STRIPE"
            ? `${getBaseUrl()}/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`
            : `${getBaseUrl()}/billing?checkout=success`;
        const cancelUrl = `${getBaseUrl()}/billing?checkout=cancelled`;

        const checkout = await providerImpl.createCheckoutSession({
            instituteId: input.instituteId,
            userId: input.userId,
            email: input.email,
            provider,
            country: context.country,
            planType: input.planType,
            interval: input.interval,
            currency: context.currency,
            amount,
            taxes,
            totalAmount,
            description: input.invoiceId ? "Invoice payment" : `${input.planType} subscription`,
            successUrl,
            cancelUrl,
            invoiceId: input.invoiceId ?? null,
            existingSubscriptionId: context.subscription.razorpaySubId ?? null,
            couponCode: input.couponCode ?? invoice?.couponCode ?? null,
            couponOriginalAmount,
            couponDiscount,
            couponFinalAmount,
        });

        return buildCheckoutSession({
            provider,
            region: context.region,
            planType: input.planType,
            interval: input.interval,
            currency: context.currency,
            amount,
            taxes,
            totalAmount,
            providerCheckout: checkout,
        });
    },

    async applyCoupon(input: {
        instituteId: string;
        userId: string;
        code: string;
        plan: PlanType;
        billingCycle: "MONTHLY" | "YEARLY";
        currency: "INR" | "USD";
        amount?: number;
    }) {
        const quotedAmount = input.amount ?? getQuotedPrice(input.plan, input.billingCycle, input.currency === "USD" ? "GLOBAL" : "IN");
        const validation = await couponService.validateCoupon({
            instituteId: input.instituteId,
            userId: input.userId,
            code: input.code,
            plan: input.plan,
            billingCycle: input.billingCycle,
            currency: input.currency,
            amount: quotedAmount,
        });

        if (!validation.valid || !validation.coupon) {
            return { valid: false, reason: validation.reason ?? "Coupon validation failed" };
        }

        const calculation = couponService.calculateDiscount({ amount: quotedAmount, coupon: validation.coupon });
        return {
            valid: true,
            coupon: validation.coupon,
            discount: calculation.discount,
            finalAmount: calculation.finalAmount,
            originalAmount: quotedAmount,
        };
    },

    async verifyCheckout(input: {
        instituteId: string;
        userId: string;
        provider: BillingProviderKey;
        paymentId?: string;
        subscriptionId?: string;
        signature?: string;
        checkoutSessionId?: string;
        invoiceId?: string | null;
    }) {
        const providerImpl = getBillingProvider(input.provider);
        const verification = await providerImpl.verifyPayment(input);

        if (!verification.verified) {
            return verification;
        }

        const subscription = await subscriptionService.getSubscription(input.instituteId);
        const invoice = input.invoiceId ? await billingRepository.findInvoiceById(input.invoiceId) : null;
        const billingInterval = subscription.billingInterval ?? "MONTHLY";
        const isStripe = input.provider === "STRIPE";
        const transactionCurrency = invoice?.currency ?? (isStripe ? "USD" : "INR");
        const planPricing = isStripe
            ? INTERNATIONAL_PRICING_USD[subscription.planType as PlanType]
            : getPlanPricing(subscription.planType as PlanType, { grandfathered: isGrandfatheredSubscription(subscription.createdAt) });
        const transactionAmount = invoice?.totalAmount ?? (billingInterval === "YEARLY" ? planPricing.yearly : planPricing.monthly);
                const periodDays = billingInterval === "YEARLY" ? 365 : 30;
                const existingTransaction = verification.providerPaymentId
                        ? await subscriptionTransactionRepository.findByProviderPaymentId(
                                input.provider,
                                verification.providerPaymentId
                            )
                        : null;

        if (!existingTransaction) {
            await subscriptionTransactionRepository.create({
                instituteId: input.instituteId,
                userId: input.userId,
                provider: input.provider,
                providerPaymentId: verification.providerPaymentId ?? null,
                providerSubscriptionId: verification.providerSubscriptionId ?? null,
                amount: transactionAmount,
                currency: transactionCurrency,
                status: "VERIFIED",
                startDate: new Date(),
                metadata: {
                    source: "checkout-confirmation",
                    checkoutSessionId: input.checkoutSessionId ?? null,
                    invoiceId: input.invoiceId ?? null,
                },
            });
        }

        if (invoice?.couponCode) {
            const coupon = await couponRepository.findByCode(invoice.couponCode);
            if (coupon) {
                await couponService.recordUsageForCoupon(coupon.id, input.userId ?? null, verification.providerPaymentId ?? input.checkoutSessionId ?? null);
            }
        }

        await subscriptionRepository.updateByInstituteId(input.instituteId, {
            billingProvider: input.provider,
            providerSubscriptionId: verification.providerSubscriptionId ?? null,
            providerPaymentId: verification.providerPaymentId ?? null,
            status: "ACTIVE",
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000),
            autopayEnabled: true,
            paymentMethodAddedAt: new Date(),
            currency: transactionCurrency,
        });

        return verification;
    },

    async createInvoicePaymentSession(input: {
        instituteId: string;
        userId: string;
        email: string;
        invoiceId: string;
        provider?: BillingProviderKey | null;
    }) {
        const invoice = await billingRepository.findInvoiceById(input.invoiceId);
        if (!invoice) {
            throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
        }

        return this.createCheckoutSession({
            instituteId: input.instituteId,
            userId: input.userId,
            email: input.email,
            planType: invoice.planCode as PlanType,
            interval: invoice.billingInterval,
            provider: input.provider,
            invoiceId: invoice.id,
        });
    },

    async getUsageSnapshot(instituteId: string, now = new Date()) {
        const subscription = await subscriptionService.getSubscription(instituteId);
        const planType = toStoredPlanType(subscription.planType, subscription.userLimit);
        const { start, end } = getCurrentMonthWindow(now);

        const alertsUsed = await billingRepository.countOutboundAlertsInWindow(instituteId, start, end);

        return {
            planType,
            alertsUsed,
            alertsIncluded: 0,
            extraAlerts: 0,
            extraAlertRate: 0,
            estimatedUsageCost: 0,
        };
    },

    async createOrUpdateClosedMonthInvoice(instituteId: string, runAt = new Date(), coupon?: { code?: string; originalAmount?: number; discountAmount?: number; finalAmount?: number }) {
        const subscription = await subscriptionService.getSubscription(instituteId);
        const planType = toStoredPlanType(subscription.planType, subscription.userLimit);
        const pricing = getPlanPricing(planType, {
            grandfathered: isGrandfatheredSubscription(subscription.createdAt),
        });

        const period = getClosedBillingPeriod(runAt);
        const alertsUsed = await billingRepository.countOutboundAlertsInWindow(instituteId, period.periodStart, period.periodEnd);
        const extraAlerts = 0;
        const usageCharge = 0;

        const interval = subscription.billingInterval ?? "MONTHLY";
        const chargedInThisPeriod = Boolean(
            subscription.lastChargedAt &&
            subscription.lastChargedAt >= period.periodStart &&
            subscription.lastChargedAt < period.periodEnd
        );

        const planCharge = subscription.status === "TRIAL"
            ? 0
            : interval === "YEARLY"
                ? chargedInThisPeriod
                    ? pricing.yearly
                    : 0
                : pricing.monthly;

        const totalAmount = round2(planCharge + usageCharge);

        const invoice = await billingRepository.upsertInvoice({
            instituteId,
            month: period.month,
            year: period.year,
            periodStart: period.periodStart,
            periodEnd: period.periodEnd,
            planCode: planType,
            billingInterval: interval,
            planCharge,
            includedAlerts: 0,
            alertsUsed,
            extraAlerts,
            extraAlertRate: 0,
            usageCharge,
            totalAmount,
            couponCode: coupon?.code ?? null,
            originalAmount: coupon?.originalAmount ?? null,
            discountAmount: coupon?.discountAmount ?? null,
            finalAmount: coupon?.finalAmount ?? null,
            dueDate: getDueDate(runAt),
            autopayEnabled: Boolean(subscription.autopayEnabled),
            metadata: {
                generatedAt: runAt.toISOString(),
                billingWindow: "1st_to_5th",
            },
        });

        if (totalAmount > 0) {
            await this.createPaymentLinkForInvoice(invoice.id).catch(() => undefined);
            await this.attemptAutopayForInvoice(invoice.id, runAt).catch(() => undefined);
        }

        return invoice;
    },

    async createPaymentLinkForInvoice(invoiceId: string) {
        const invoice = await billingRepository.findInvoiceById(invoiceId);

        if (!invoice) {
            throw new AppError("Invoice not found", 404, "INVOICE_NOT_FOUND");
        }

        if (invoice.totalAmount <= 0) {
            return invoice;
        }

        assertRazorpayReady();
        const paymentLink = await (razorpay as any).paymentLink.create({
            amount: Math.round(invoice.totalAmount * 100),
            currency: "INR",
            description: `Classes360 invoice ${invoice.month}/${invoice.year}`,
            reference_id: `invoice_${invoice.id}`,
            notify: {
                sms: false,
                email: false,
            },
            notes: {
                instituteId: invoice.instituteId,
                invoiceId: invoice.id,
                period: `${invoice.month}-${invoice.year}`,
                couponCode: invoice.couponCode ?? "",
                discountAmount: invoice.discountAmount != null ? String(invoice.discountAmount) : "0",
                finalAmount: invoice.finalAmount != null ? String(invoice.finalAmount) : String(invoice.totalAmount),
            },
        });

        return billingRepository.attachPaymentLink(invoice.id, paymentLink);
    },

    async markInvoicePaidFromWebhook(paymentLinkId: string) {
        return billingRepository.markInvoicePaidByPaymentLinkId(paymentLinkId);
    },

    async getOperationalPolicy(instituteId: string) {
        const [subscription, hasOverdue, hasExhaustedPendingInvoice] = await Promise.all([
            subscriptionService.getSubscription(instituteId),
            billingRepository.hasOverdueInvoice(instituteId),
            billingRepository.hasExhaustedPendingInvoice(instituteId, RETRY_DAY_OFFSETS.length),
        ]);

        const trialExpired = Boolean(subscription.trialEndsAt && subscription.trialEndsAt.getTime() < Date.now());
        const paymentMethodConfigured = Boolean(subscription.autopayEnabled || subscription.paymentMethodAddedAt);
        const requiresPaymentMethod = subscription.status === "TRIAL" && !paymentMethodConfigured;
        const trialDaysRemaining = subscription.trialEndsAt
            ? Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
            : null;
        const trialReminder = requiresPaymentMethod && trialDaysRemaining !== null && trialDaysRemaining <= 2;

        const trialPaymentMissingRestricted = trialExpired && !paymentMethodConfigured;

        return {
            trialReminder,
            trialDaysRemaining,
            requiresPaymentMethod,
            paymentMethodConfigured,
            trialPaymentMissingRestricted,
            hasOverdue,
            hasExhaustedPendingInvoice,
            notifyPaymentMethodUpdate: hasExhaustedPendingInvoice,
            canCreateLeads: !trialPaymentMissingRestricted,
            canSendAlerts: !trialPaymentMissingRestricted && !hasOverdue,
            canProcessPayments: !trialPaymentMissingRestricted,
            readOnlyMode: trialPaymentMissingRestricted,
        };
    },

    async assertCanCreateLeads(instituteId: string) {
        const policy = await this.getOperationalPolicy(instituteId);
        if (!policy.canCreateLeads) {
            throw new AppError("Please add payment method to continue creating leads", 402, "PAYMENT_METHOD_REQUIRED_FOR_LEADS");
        }
    },

    async assertCanProcessPayments(instituteId: string) {
        const policy = await this.getOperationalPolicy(instituteId);
        if (!policy.canProcessPayments) {
            throw new AppError("Please add payment method to continue payment processing", 402, "PAYMENT_METHOD_REQUIRED_FOR_PAYMENTS");
        }
    },

    async attemptAutopayForInvoice(invoiceId: string, now = new Date()) {
        const invoice = await billingRepository.findInvoiceById(invoiceId);
        if (!invoice || invoice.status !== "PENDING") {
            throw new AppError("Invoice not available for autopay attempt", 404, "INVOICE_NOT_PENDING");
        }

        const subscription = await subscriptionService.getSubscription(invoice.instituteId);
        if (!subscription.autopayEnabled) {
            return invoice;
        }

        if (!invoice.razorpayPaymentLinkId) {
            await this.createPaymentLinkForInvoice(invoice.id).catch(() => undefined);
        }

        const nextAttemptIndex = Math.min(invoice.paymentAttempts + 1, RETRY_DAY_OFFSETS.length - 1);
        const nextRetryAt = nextAttemptIndex >= RETRY_DAY_OFFSETS.length - 1
            ? null
            : addDaysUtc(now, RETRY_DAY_OFFSETS[nextAttemptIndex]);

        return billingRepository.recordAutopayAttempt(invoice.id, {
            nextRetryAt,
            reason: nextRetryAt ? "AUTOPAY_RETRY_SCHEDULED" : "AUTOPAY_RETRIES_EXHAUSTED",
        });
    },

    async runDunningCycle(now = new Date()) {
        const invoices = await billingRepository.listPendingRetryInvoices(now, RETRY_DAY_OFFSETS.length, 100);
        const attempted = await Promise.all(
            invoices.map((invoice) => this.attemptAutopayForInvoice(invoice.id, now).catch(() => null))
        );

        return {
            scanned: invoices.length,
            attempted: attempted.filter(Boolean).length,
        };
    },

    async enforceOverduePolicy(instituteId: string, now = new Date()) {
        await billingRepository.markOverdueInvoices(now);
        const hasOverdue = await billingRepository.hasOverdueInvoice(instituteId);
        return {
            hasOverdue,
            alertsEnabled: !hasOverdue,
            accessRestricted: hasOverdue,
        };
    },

    async getBillingDashboard(instituteId: string, contactEmail?: string | null) {
        const [summary, usage, invoices, policy, sender] = await Promise.all([
            subscriptionService.getBillingSummary(instituteId),
            this.getUsageSnapshot(instituteId),
            billingRepository.listInvoices(instituteId, 12),
            this.getOperationalPolicy(instituteId),
            whatsappIntegrationService.getIntegrationSettings(instituteId),
        ]);
        const institute = await instituteRepository.findById(instituteId);

        const checkoutContext = await this.getCheckoutContext(instituteId);

        return {
            billingContact: {
                name: institute?.name ?? "Billing contact",
                email: contactEmail ?? null,
            },
            institute: {
                id: institute?.id ?? instituteId,
                name: institute?.name ?? null,
                country: institute?.address?.country ?? null,
                countryCode: institute?.address?.countryCode ?? null,
            },
            summary,
            usage,
            policy,
            checkout: {
                provider: checkoutContext.provider,
                region: checkoutContext.region,
                regionLabel: checkoutContext.regionLabel,
                country: checkoutContext.country,
                recommendedProvider: checkoutContext.recommendedProvider,
                allowedProviders: checkoutContext.allowedProviders,
                currency: checkoutContext.currency,
                taxRate: checkoutContext.taxRate,
            },
            sender: {
                mode: sender.mode,
                connectedNumber: sender.connectedNumber,
                status: sender.status,
            },
            invoices: invoices.map((invoice) => ({
                id: invoice.id,
                month: invoice.month,
                year: invoice.year,
                periodStart: invoice.periodStart,
                periodEnd: invoice.periodEnd,
                planCharge: invoice.planCharge,
                usageCharge: invoice.usageCharge,
                totalAmount: invoice.totalAmount,
                status: invoice.status,
                dueDate: invoice.dueDate,
                issuedAt: invoice.issuedAt,
                paidAt: invoice.paidAt,
                downloadUrl: invoice.downloadUrl,
                paymentLinkUrl: invoice.paymentLinkUrl,
            })),
        };
    },
};

