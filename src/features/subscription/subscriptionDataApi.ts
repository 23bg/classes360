import { prisma } from "@/lib/db/prisma";
import { DEFAULT_PLAN_TYPE, PLAN_CONFIG, PlanType } from "@/config/plans";

const mapPlanTypeToDb = (planType: PlanType) => {
    // Prisma enum currently uses SOLO/TEAM. Map app-level plans to DB enum.
    switch (planType) {
        case "STARTER":
            return "SOLO" as const;
        case "TEAM":
        case "GROWTH":
        case "SCALE":
            return "TEAM" as const;
        default:
            return "SOLO" as const;
    }
};

export const subscriptionRepository = {
    createTrial: async (instituteId: string, planType: PlanType = DEFAULT_PLAN_TYPE) =>
        prisma.subscription.upsert({
            where: { instituteId },
            create: {
                instituteId,
                planType: mapPlanTypeToDb(planType),
                // 0 is stored as the sentinel value for "unlimited" (null in PlanConfig)
                userLimit: PLAN_CONFIG[planType].userLimit ?? 0,
                status: "TRIAL",
                trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
            update: {},
        }),

    findByInstituteId: async (instituteId: string) =>
        prisma.subscription.findUnique({
            where: { instituteId },
        }),

    findByRazorpaySubId: async (razorpaySubId: string) =>
        prisma.subscription.findFirst({
            where: { razorpaySubId },
        }),

    updateByInstituteId: async (
        instituteId: string,
        payload: {
            status?: "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
            currentPeriodEnd?: Date | null;
            razorpaySubId?: string | null;
            trialEndsAt?: Date | null;
            planType?: PlanType;
            userLimit?: number;
            billingInterval?: "MONTHLY" | "YEARLY";
            lastChargedAt?: Date | null;
            autopayEnabled?: boolean;
            paymentMethodAddedAt?: Date | null;
        }
    ) =>
        prisma.subscription.update({
            where: { instituteId },
            data: {
                ...payload,
                ...(payload.planType ? { planType: mapPlanTypeToDb(payload.planType) } : {}),
            } as any,
        }),

    upsertByRazorpaySubId: async (
        razorpaySubId: string,
        instituteId: string,
        payload: {
            status?: "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
            currentPeriodEnd?: Date | null;
            trialEndsAt?: Date | null;
            planType?: PlanType;
            userLimit?: number;
            billingInterval?: "MONTHLY" | "YEARLY";
            lastChargedAt?: Date | null;
            autopayEnabled?: boolean;
            paymentMethodAddedAt?: Date | null;
        }
    ) =>
        prisma.subscription.upsert({
            where: { instituteId },
            create: {
                instituteId,
                razorpaySubId,
                planType: mapPlanTypeToDb(payload.planType ?? DEFAULT_PLAN_TYPE),
                // 0 = unlimited sentinel
                userLimit: payload.userLimit ?? PLAN_CONFIG[payload.planType ?? DEFAULT_PLAN_TYPE].userLimit ?? 0,
                status: payload.status ?? "TRIAL",
                currentPeriodEnd: payload.currentPeriodEnd,
                trialEndsAt: payload.trialEndsAt,
                billingInterval: payload.billingInterval,
                lastChargedAt: payload.lastChargedAt,
                autopayEnabled: payload.autopayEnabled ?? false,
                paymentMethodAddedAt: payload.paymentMethodAddedAt,
            },
            update: {
                razorpaySubId,
                status: payload.status,
                currentPeriodEnd: payload.currentPeriodEnd,
                trialEndsAt: payload.trialEndsAt,
                billingInterval: payload.billingInterval,
                lastChargedAt: payload.lastChargedAt,
                autopayEnabled: payload.autopayEnabled,
                paymentMethodAddedAt: payload.paymentMethodAddedAt,
                ...(payload.planType ? { planType: mapPlanTypeToDb(payload.planType) } : {}),
                userLimit: payload.userLimit,
            },
        }),

    updateByRazorpaySubId: async (
        razorpaySubId: string,
        payload: {
            status?: "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
            currentPeriodEnd?: Date | null;
            trialEndsAt?: Date | null;
            lastChargedAt?: Date | null;
            autopayEnabled?: boolean;
            paymentMethodAddedAt?: Date | null;
        }
    ) =>
        prisma.subscription.updateMany({
            where: { razorpaySubId },
            data: payload,
        }),
};
