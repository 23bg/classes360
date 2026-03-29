import { getPlanPricing, isGrandfatheredSubscription, PLAN_CONFIG, PlanType } from "@/config/plans";
import { billingRepository } from "@/features/billing/billingDataApi";
import { subscriptionService } from "@/features/subscription/subscriptionApi";
import { assertRazorpayReady, razorpay } from "@/lib/billing/razorpay";
import { AppError } from "@/lib/utils/error";
import { whatsappIntegrationService } from "@/features/whatsapp/whatsappApi";

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

const addDaysUtc = (value: Date, offsetDays: number) =>
    new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate() + offsetDays, value.getUTCHours(), value.getUTCMinutes(), value.getUTCSeconds(), value.getUTCMilliseconds()));

export const billingService = {
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

    async createOrUpdateClosedMonthInvoice(instituteId: string, runAt = new Date()) {
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

    async getBillingDashboard(instituteId: string) {
        const [summary, usage, invoices, policy, sender] = await Promise.all([
            subscriptionService.getBillingSummary(instituteId),
            this.getUsageSnapshot(instituteId),
            billingRepository.listInvoices(instituteId, 12),
            this.getOperationalPolicy(instituteId),
            whatsappIntegrationService.getIntegrationSettings(instituteId),
        ]);

        return {
            summary,
            usage,
            policy,
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

