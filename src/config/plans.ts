export type PlanType = "STARTER" | "TEAM" | "GROWTH" | "SCALE";
export type PricingVersion = "LEGACY" | "CURRENT";

export type PlanPricing = {
    monthly: number;
    yearly: number;
};

type PlanConfig = {
    key: PlanType;
    name: string;
    priceMonthly: number;
    priceYearly: number;
    /** null means unlimited */
    userLimit: number | null;
    whatsappMonthlyLimit: number;
    whatsappDailyLimit: number;
    /** cost in INR per extra conversation over monthly limit */
    extraConversationCost: number;
    tagline: string;
};

export const PLAN_CONFIG: Record<PlanType, PlanConfig> = {
    STARTER: {
        key: "STARTER",
        name: "Starter",
        priceMonthly: 999,
        priceYearly: 9990,
        userLimit: 1,
        whatsappMonthlyLimit: 500,
        whatsappDailyLimit: 17,
        extraConversationCost: 0,
        tagline: "For solo institute owners starting admissions management",
    },
    TEAM: {
        key: "TEAM",
        name: "Team",
        priceMonthly: 2499,
        priceYearly: 24990,
        userLimit: 10,
        whatsappMonthlyLimit: 2500,
        whatsappDailyLimit: 84,
        extraConversationCost: 0,
        tagline: "For small admission teams collaborating daily",
    },
    GROWTH: {
        key: "GROWTH",
        name: "Growth",
        priceMonthly: 4999,
        priceYearly: 49990,
        userLimit: 25,
        whatsappMonthlyLimit: 7500,
        whatsappDailyLimit: 250,
        extraConversationCost: 0,
        tagline: "For institutes scaling admissions volume",
    },
    SCALE: {
        key: "SCALE",
        name: "Scale",
        // Enterprise / custom pricing — base price is handled via sales.
        priceMonthly: 0,
        priceYearly: 0,
        userLimit: null,
        // Pay-as-you-go WhatsApp handling: no included monthly quota
        whatsappMonthlyLimit: 0,
        whatsappDailyLimit: 300,
        // cost per extra conversation (INR) when applicable for pay-as-you-go
        extraConversationCost: 0.5,
        tagline: "For large institutes with multiple counselors and high volume",
    },
};

export const DEFAULT_PLAN_TYPE: PlanType = "STARTER";

// Existing institutes created before this timestamp are grandfathered on legacy prices.
export const PRICING_V2_EFFECTIVE_AT = new Date("2026-03-16T00:00:00+05:30");

export const PLAN_PRICING_LEGACY: Record<PlanType, PlanPricing> = {
    STARTER: { monthly: 399, yearly: 3990 },
    TEAM: { monthly: 899, yearly: 8990 },
    GROWTH: { monthly: 1799, yearly: 17990 },
    SCALE: { monthly: 3999, yearly: 39990 },
};

export const PLAN_PRICING_CURRENT: Record<PlanType, PlanPricing> = {
    STARTER: { monthly: 999, yearly: 9990 },
    TEAM: { monthly: 2499, yearly: 24990 },
    GROWTH: { monthly: 4999, yearly: 49990 },
    SCALE: { monthly: 0, yearly: 0 },
};

export const AUTOMATION_PACK_PRICING: PlanPricing = {
    monthly: 499,
    yearly: 4990,
};

export const isGrandfatheredSubscription = (createdAt?: Date | null): boolean => {
    if (!createdAt) {
        return false;
    }

    return createdAt.getTime() < PRICING_V2_EFFECTIVE_AT.getTime();
};

export const getPlanPricing = (
    planType: PlanType,
    options?: { grandfathered?: boolean; version?: PricingVersion }
): PlanPricing => {
    const version = options?.version ?? (options?.grandfathered ? "LEGACY" : "CURRENT");
    return version === "LEGACY" ? PLAN_PRICING_LEGACY[planType] : PLAN_PRICING_CURRENT[planType];
};

export const isPlanType = (value: string): value is PlanType =>
    value === "STARTER" || value === "TEAM" || value === "GROWTH" || value === "SCALE";

/** Returns true when the plan has no user-count cap */
export const isUnlimitedUsers = (limit: number | null): boolean => limit === null;