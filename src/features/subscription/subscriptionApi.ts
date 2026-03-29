import { AppError } from "@/lib/utils/error";
import { subscriptionRepository } from "@/features/subscription/subscriptionDataApi";
import { assertRazorpayReady, razorpay, verifyRazorpayCheckoutSignature } from "@/lib/billing/razorpay";
import { env } from "@/lib/config/env";
import { DEFAULT_PLAN_TYPE, getPlanPricing, isGrandfatheredSubscription, isPlanType, PLAN_CONFIG, PlanType, PricingVersion } from "@/config/plans";
import { userRepository } from "@/features/auth/userDataApi";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";

export type SubscriptionState = "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
type SubscriptionRecord = {
    instituteId: string;
    status: SubscriptionState;
    trialEndsAt: Date | null;
    planType?: string | null;
    userLimit?: number | null;
    razorpaySubId?: string | null;
    currentPeriodEnd?: Date | null;
    updatedAt?: Date;
    createdAt?: Date;
    billingInterval?: BillingInterval | null;
    lastChargedAt?: Date | null;
    autopayEnabled?: boolean;
    paymentMethodAddedAt?: Date | null;
};

const DASHBOARD_ALLOWED: SubscriptionState[] = ["TRIAL", "ACTIVE"];

export type BillingInterval = "MONTHLY" | "YEARLY";

const normalizeStoredPlanType = (storedPlanType: string | null | undefined, userLimit?: number | null): PlanType => {
    if (storedPlanType === "STARTER" || storedPlanType === "TEAM" || storedPlanType === "GROWTH" || storedPlanType === "SCALE") {
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

        return "GROWTH";
    }

    return DEFAULT_PLAN_TYPE;
};

export const subscriptionService = {
    canAccessDashboard(status: SubscriptionState): boolean {
        return DASHBOARD_ALLOWED.includes(status);
    },

    resolvePlanType(input?: string | null): PlanType {
        if (input && isPlanType(input)) {
            return input;
        }
        return DEFAULT_PLAN_TYPE;
    },

    getRazorpayPlanId(
        planType: PlanType,
        interval: BillingInterval = "MONTHLY",
        options?: { grandfathered?: boolean }
    ): string {
        const currentLookup: Record<PlanType, Record<BillingInterval, string | undefined>> = {
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

        const legacyLookup: Record<PlanType, Record<BillingInterval, string | undefined>> = {
            STARTER: {
                MONTHLY: env.RAZORPAY_PLAN_ID_SOLO ?? env.RAZORPAY_PLAN_ID_STARTER_MONTHLY,
                YEARLY: env.RAZORPAY_PLAN_ID_STARTER_YEARLY,
            },
            TEAM: {
                MONTHLY: env.RAZORPAY_PLAN_ID_TEAM ?? env.RAZORPAY_PLAN_ID_TEAM_MONTHLY ?? env.RAZORPAY_PLAN_ID_GROWTH_MONTHLY,
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

        const lookup = options?.grandfathered ? legacyLookup : currentLookup;
        const planId = lookup[planType]?.[interval] ?? currentLookup[planType]?.[interval];
        if (!planId) {
            throw new AppError(`Missing Razorpay plan id for ${planType}/${interval}`, 500, "RAZORPAY_PLAN_ID_MISSING");
        }

        return planId;
    },

    async createSubscription(instituteId: string, planType: PlanType = DEFAULT_PLAN_TYPE) {
        const created = await subscriptionRepository.createTrial(instituteId, planType);

        await eventDispatcherService.dispatch({
            event: "TRIAL_STARTED",
            instituteId,
            message: "Trial has started for your institute.",
            link: "/billing",
            metadata: { planType },
        });

        return created;
    },

    async syncTrialStatus(subscription: SubscriptionRecord): Promise<SubscriptionRecord> {
        if (
            subscription.status === "TRIAL" &&
            subscription.trialEndsAt &&
            subscription.trialEndsAt.getTime() < Date.now()
        ) {
            const nextStatus: SubscriptionState = subscription.autopayEnabled ? "ACTIVE" : "INACTIVE";
            return subscriptionRepository.updateByInstituteId(subscription.instituteId, {
                status: nextStatus,
            });
        }

        return subscription;
    },

    async getSubscription(instituteId: string) {
        const existing = await subscriptionRepository.findByInstituteId(instituteId);
        if (!existing) {
            const created = await subscriptionRepository.createTrial(instituteId);
            return this.syncTrialStatus(created);
        }

        return this.syncTrialStatus(existing);
    },

    async getBillingSummary(instituteId: string) {
        const subscription = await this.getSubscription(instituteId);
        const planType = normalizeStoredPlanType(subscription.planType, subscription.userLimit);
        const plan = PLAN_CONFIG[planType];
        const isGrandfathered = isGrandfatheredSubscription(subscription.createdAt);
        const price = getPlanPricing(planType, { grandfathered: isGrandfathered });
        const pricingVersion: PricingVersion = isGrandfathered ? "LEGACY" : "CURRENT";
        const usersUsed = await userRepository.countByInstitute(instituteId);
        const userLimit = subscription.userLimit ?? plan.userLimit;
        const hasAnySubscriptionActivity = Boolean(subscription.razorpaySubId || subscription.currentPeriodEnd || subscription.status === "ACTIVE");
        const trialDaysRemaining = subscription.trialEndsAt
            ? Math.ceil((subscription.trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
            : null;
        const paymentMethodRequired = subscription.status === "TRIAL" && !subscription.autopayEnabled;
        const trialPaymentReminder = paymentMethodRequired && trialDaysRemaining !== null && trialDaysRemaining <= 2;

        return {
            planType,
            planName: plan.name,
            planAmount: price.monthly,
            planAmountYearly: price.yearly,
            pricingVersion,
            currency: "INR",
            billingInterval: subscription.billingInterval ?? "MONTHLY",
            userLimit,
            usersUsed,
            status: subscription.status,
            autopayEnabled: Boolean(subscription.autopayEnabled),
            paymentMethodAddedAt: subscription.paymentMethodAddedAt ?? null,
            trialDaysRemaining,
            trialPaymentReminder,
            nextBillingDate: subscription.currentPeriodEnd ?? subscription.trialEndsAt,
            razorpaySubId: subscription.razorpaySubId,
            lastPaymentAmount: hasAnySubscriptionActivity ? price.monthly : null,
            lastPaymentDate: hasAnySubscriptionActivity ? subscription.updatedAt : null,
        };
    },

    async createRazorpaySubscription(
        instituteId: string,
        requestedPlanType?: string,
        interval: BillingInterval = "MONTHLY"
    ) {
        assertRazorpayReady();
        const planType = this.resolvePlanType(requestedPlanType);
        const plan = PLAN_CONFIG[planType];

        const existing = await subscriptionRepository.findByInstituteId(instituteId);
        const grandfathered = isGrandfatheredSubscription(existing?.createdAt);
        const planId = this.getRazorpayPlanId(planType, interval, { grandfathered });
        const existingPlanType = existing
            ? normalizeStoredPlanType(existing.planType, existing.userLimit)
            : null;

        if (existing?.razorpaySubId && existingPlanType === planType) {
            return {
                subscriptionId: existing.razorpaySubId,
                planType,
                interval,
                reused: true,
            };
        }

        const created = await razorpay!.subscriptions.create({
            plan_id: planId,
            quantity: 1,
            total_count: 12,
            customer_notify: 1,
            notes: {
                instituteId,
                planType,
            },
        });

        await subscriptionRepository.upsertByRazorpaySubId(created.id, instituteId, {
            status: "INACTIVE",
            planType,
            userLimit: plan.userLimit ?? undefined,
            billingInterval: interval,
        });

        return {
            subscriptionId: created.id,
            planType,
            interval,
            status: "INACTIVE" as const,
            reused: false,
        };
    },

    async confirmRazorpaySubscription(input: {
        instituteId: string;
        paymentId: string;
        subscriptionId: string;
        signature: string;
    }) {
        const isValid = verifyRazorpayCheckoutSignature({
            paymentId: input.paymentId,
            subscriptionId: input.subscriptionId,
            signature: input.signature,
        });

        if (!isValid) {
            throw new AppError("Invalid Razorpay checkout signature", 401, "INVALID_CHECKOUT_SIGNATURE");
        }

        const existing = await subscriptionRepository.findByInstituteId(input.instituteId);
        if (!existing || existing.razorpaySubId !== input.subscriptionId) {
            throw new AppError("Subscription mismatch for institute", 400, "SUBSCRIPTION_MISMATCH");
        }

        const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
        const updated = await subscriptionRepository.updateByInstituteId(input.instituteId, {
            status: "TRIAL",
            trialEndsAt,
            autopayEnabled: true,
            paymentMethodAddedAt: new Date(),
        });

        await eventDispatcherService.dispatch({
            event: "SUBSCRIPTION_CREATED",
            instituteId: input.instituteId,
            message: "Subscription has been created successfully.",
            link: "/billing",
            metadata: { razorpaySubId: input.subscriptionId },
        });

        return {
            instituteId: updated.instituteId,
            razorpaySubId: updated.razorpaySubId,
            status: updated.status,
            trialEndsAt: updated.trialEndsAt,
        };
    },

    async isActive(instituteId: string): Promise<boolean> {
        const subscription = await this.getSubscription(instituteId);
        return DASHBOARD_ALLOWED.includes(subscription.status as SubscriptionState);
    },

    mapWebhookEventToStatus(event: string): SubscriptionState | null {
        switch (event) {
            case "subscription.activated":
                return "ACTIVE";
            case "subscription.charged":
                return "ACTIVE";
            case "subscription.cancelled":
                return "CANCELLED";
            case "payment.failed":
                return "INACTIVE";
            default:
                return null;
        }
    },

    assertKnownEvent(event: string): void {
        const supported = ["subscription.activated", "subscription.charged", "subscription.cancelled", "payment.failed"];
        if (!supported.includes(event)) {
            throw new AppError(`Unsupported Razorpay event: ${event}`, 400, "UNSUPPORTED_WEBHOOK_EVENT");
        }
    },

    async handleWebhookEvent(input: {
        event: string;
        instituteId?: string;
        razorpaySubId?: string;
        currentPeriodEnd?: Date | null;
    }) {
        this.assertKnownEvent(input.event);
        const status = this.mapWebhookEventToStatus(input.event);

        if (!status) {
            throw new AppError("Unable to map webhook event status", 400, "INVALID_SUBSCRIPTION_EVENT");
        }

        if (input.razorpaySubId && input.instituteId) {
            const updated = await subscriptionRepository.upsertByRazorpaySubId(input.razorpaySubId, input.instituteId, {
                status,
                currentPeriodEnd: input.currentPeriodEnd,
                ...(input.event === "subscription.charged" ? { lastChargedAt: new Date() } : {}),
            });

            await this.emitWebhookNotificationEvent(input.event, updated.instituteId, input.razorpaySubId);
            return updated;
        }

        if (input.razorpaySubId) {
            await subscriptionRepository.updateByRazorpaySubId(input.razorpaySubId, {
                status,
                currentPeriodEnd: input.currentPeriodEnd,
                ...(input.event === "subscription.charged" ? { lastChargedAt: new Date() } : {}),
            });

            const target = await subscriptionRepository.findByRazorpaySubId(input.razorpaySubId);
            if (!target) {
                throw new AppError("Subscription not found for webhook subscription id", 404, "SUBSCRIPTION_NOT_FOUND");
            }

            await this.emitWebhookNotificationEvent(input.event, target.instituteId, input.razorpaySubId);
            return target;
        }

        if (!input.instituteId) {
            throw new AppError("instituteId or razorpaySubId is required", 400, "SUBSCRIPTION_TARGET_MISSING");
        }

        const updated = await subscriptionRepository.updateByInstituteId(input.instituteId, {
            status,
            currentPeriodEnd: input.currentPeriodEnd,
            ...(input.event === "subscription.charged" ? { lastChargedAt: new Date() } : {}),
        });

        await this.emitWebhookNotificationEvent(input.event, updated.instituteId, input.razorpaySubId);
        return updated;
    },

    async emitWebhookNotificationEvent(event: string, instituteId: string, razorpaySubId?: string) {
        if (event === "subscription.charged") {
            await eventDispatcherService.dispatch({
                event: "SUBSCRIPTION_PAYMENT_SUCCESS",
                instituteId,
                message: "Subscription payment successful.",
                link: "/billing",
                metadata: { razorpaySubId },
            });
            return;
        }

        if (event === "payment.failed") {
            await eventDispatcherService.dispatch({
                event: "SUBSCRIPTION_PAYMENT_FAILED",
                instituteId,
                message: "Subscription payment failed.",
                link: "/billing",
                metadata: { razorpaySubId },
            });
            return;
        }

        if (event === "subscription.cancelled") {
            await eventDispatcherService.dispatch({
                event: "SUBSCRIPTION_CANCELLED",
                instituteId,
                message: "Subscription cancelled.",
                link: "/billing",
                metadata: { razorpaySubId },
            });
            return;
        }

        if (event === "subscription.activated") {
            await eventDispatcherService.dispatch({
                event: "SUBSCRIPTION_CREATED",
                instituteId,
                message: "Subscription activated.",
                link: "/billing",
                metadata: { razorpaySubId },
            });
        }
    },
};

