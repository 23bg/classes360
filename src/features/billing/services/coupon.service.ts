import { AppError } from "@/lib/utils/error";
import { getPlanPricing, PlanType } from "@/config/plans";
import { couponRepository } from "@/features/billing/repositories/coupon.repo";
import type { BillingInterval } from "@/features/subscription/subscriptionApi";
import { subscriptionService } from "@/features/subscription/services/subscription.service";

export type CouponType = "percentage" | "flat";

export type BillingCouponData = {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    currency?: "INR" | "USD" | null;
    maxDiscountAmount?: number | null;
    minOrderAmount?: number | null;
    usageLimit?: number | null;
    usagePerUser?: number | null;
    usedCount: number;
    applicablePlans?: string[] | null;
    applicableBillingCycle?: string[] | null;
    isActive: boolean;
    startsAt?: Date | null;
    expiresAt?: Date | null;
};

export type CouponValidationInput = {
    code: string;
    userId: string;
    instituteId: string;
    plan: PlanType;
    billingCycle: BillingInterval;
    amount?: number;
    currency: "INR" | "USD";
};

export type CouponValidationResult = {
    valid: boolean;
    reason?: string;
    coupon?: BillingCouponData;
};

export type CouponCalculationResult = {
    discount: number;
    finalAmount: number;
};

const DEFAULT_COUPONS: Array<Omit<BillingCouponData, "id" | "usedCount">> = [
    {
        code: "TRIAL20",
        type: "percentage",
        value: 20,
        currency: undefined,
        maxDiscountAmount: undefined,
        minOrderAmount: undefined,
        usageLimit: 9999,
        usagePerUser: 1,
        applicablePlans: ["STARTER", "TEAM", "GROWTH", "SCALE"],
        applicableBillingCycle: ["MONTHLY", "YEARLY"],
        isActive: true,
        startsAt: undefined,
        expiresAt: undefined,
    },
    {
        code: "YEARLY1000",
        type: "flat",
        value: 1000,
        currency: "INR",
        maxDiscountAmount: undefined,
        minOrderAmount: undefined,
        usageLimit: 9999,
        usagePerUser: undefined,
        applicablePlans: ["STARTER", "TEAM", "GROWTH", "SCALE"],
        applicableBillingCycle: ["YEARLY"],
        isActive: true,
        startsAt: undefined,
        expiresAt: undefined,
    },
    {
        code: "REF500",
        type: "flat",
        value: 500,
        currency: "INR",
        maxDiscountAmount: undefined,
        minOrderAmount: undefined,
        usageLimit: 9999,
        usagePerUser: 1,
        applicablePlans: ["STARTER", "TEAM", "GROWTH", "SCALE"],
        applicableBillingCycle: ["MONTHLY", "YEARLY"],
        isActive: true,
        startsAt: undefined,
        expiresAt: undefined,
    },
];

let initialCouponsSeeded = false;

const normalizeCode = (code: string) => code.trim().toUpperCase();

const round2 = (value: number) => Math.round(value * 100) / 100;

const getQuotedPrice = (planType: PlanType, interval: BillingInterval, currency: "INR" | "USD") => {
    if (currency === "USD") {
        const pricing = {
            STARTER: { monthly: 12, yearly: 120 },
            TEAM: { monthly: 24, yearly: 240 },
            GROWTH: { monthly: 42, yearly: 420 },
            SCALE: { monthly: 60, yearly: 600 },
        } as const;
        return pricing[planType][interval === "YEARLY" ? "yearly" : "monthly"];
    }

    const pricing = getPlanPricing(planType, { version: "CURRENT" });
    return interval === "YEARLY" ? pricing.yearly : pricing.monthly;
};

const getSubscriptionStatus = async (instituteId: string) => {
    try {
        const subscription = await subscriptionService.getSubscription(instituteId);
        return {
            status: subscription.status ?? null,
            trialEndsAt: subscription.trialEndsAt ?? null,
        };
    } catch {
        return { status: null, trialEndsAt: null };
    }
};

export const couponService = {
    async ensureDefaultCoupons() {
        if (initialCouponsSeeded) {
            return;
        }

        await couponRepository.seedCoupons(
            DEFAULT_COUPONS.map((coupon) => ({
                ...coupon,
                currency: coupon.currency ?? undefined,
                startsAt: coupon.startsAt ?? undefined,
                expiresAt: coupon.expiresAt ?? undefined,
                applicablePlans: coupon.applicablePlans ?? undefined,
                applicableBillingCycle: coupon.applicableBillingCycle ?? undefined,
            }))
        );
        initialCouponsSeeded = true;
    },

    async validateCoupon(input: CouponValidationInput): Promise<CouponValidationResult> {
        await this.ensureDefaultCoupons();
        const now = new Date();
        const code = normalizeCode(input.code);
        const coupon = await couponRepository.findByCode(code);

        if (!coupon) {
            return { valid: false, reason: "Coupon not found." };
        }

        if (!coupon.isActive) {
            return { valid: false, reason: "This coupon is no longer active." };
        }

        if (coupon.startsAt && now < coupon.startsAt) {
            return { valid: false, reason: "This coupon is not valid yet." };
        }

        if (coupon.expiresAt && now > coupon.expiresAt) {
            return { valid: false, reason: "This coupon has expired." };
        }

        if (coupon.currency && coupon.currency !== input.currency) {
            return { valid: false, reason: "This coupon is valid only for " + coupon.currency + "." };
        }

        const amount = input.amount ?? getQuotedPrice(input.plan, input.billingCycle, input.currency);

        if (coupon.minOrderAmount && amount < coupon.minOrderAmount) {
            return { valid: false, reason: `Minimum order amount for this coupon is ${coupon.minOrderAmount}.` };
        }

        if (coupon.applicablePlans && coupon.applicablePlans.length > 0 && !coupon.applicablePlans.includes(input.plan)) {
            return { valid: false, reason: "This coupon cannot be used with the selected plan." };
        }

        if (coupon.applicableBillingCycle && coupon.applicableBillingCycle.length > 0 && !coupon.applicableBillingCycle.includes(input.billingCycle)) {
            return { valid: false, reason: "This coupon is not valid for the selected billing frequency." };
        }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return { valid: false, reason: "This coupon has reached its usage limit." };
        }

        if (coupon.usagePerUser) {
            const userUsage = await couponRepository.countUsageByUser(coupon.id, input.userId);
            if (userUsage >= coupon.usagePerUser) {
                return { valid: false, reason: "You have already used this coupon." };
            }
        }

        if (coupon.code === "TRIAL20") {
            const subscription = await getSubscriptionStatus(input.instituteId);
            if (subscription.status === "TRIAL" || (subscription.trialEndsAt && subscription.trialEndsAt > now)) {
                return { valid: false, reason: "This coupon can only be used after your trial ends." };
            }
        }

        return { valid: true, coupon };
    },

    calculateDiscount(input: { amount: number; coupon: BillingCouponData }): CouponCalculationResult {
        const amount = Math.max(0, Math.round(input.amount * 100) / 100);
        let discount = 0;

        if (input.coupon.type === "percentage") {
            discount = (amount * input.coupon.value) / 100;
        } else {
            discount = input.coupon.value;
        }

        if (input.coupon.maxDiscountAmount != null) {
            discount = Math.min(discount, input.coupon.maxDiscountAmount);
        }

        discount = Math.max(0, round2(discount));
        const finalAmount = Math.max(0, round2(amount - discount));

        return {
            discount,
            finalAmount,
        };
    },

    async recordUsageForCoupon(couponId: string, userId?: string | null, orderId?: string | null) {
        await Promise.all([
            couponRepository.incrementUsageCount(couponId),
            couponRepository.createUsage({ couponId, userId, orderId }),
        ]);
    },
};
