import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export const couponRepository = {
    findByCode: async (code: string) =>
        prisma.billingCoupon.findUnique({
            where: { code },
        }),

    countUsageByUser: async (couponId: string, userId: string) =>
        prisma.billingCouponUsage.count({
            where: {
                couponId,
                userId,
            },
        }),

    incrementUsageCount: async (couponId: string) =>
        prisma.billingCoupon.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } },
        }),

    createUsage: async (input: { couponId: string; userId?: string | null; orderId?: string | null }) =>
        prisma.billingCouponUsage.create({
            data: {
                couponId: input.couponId,
                userId: input.userId ?? null,
                orderId: input.orderId ?? null,
            },
        }),

    seedCoupons: async (coupons: Array<Omit<Prisma.BillingCouponCreateInput, "id" | "createdAt" | "updatedAt" | "usedCount">>) => {
        await Promise.all(
            coupons.map(async (coupon) => {
                await prisma.billingCoupon.upsert({
                    where: { code: coupon.code as string },
                    create: {
                        ...coupon,
                        usedCount: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    } as Prisma.BillingCouponCreateInput,
                    update: {
                        ...coupon,
                        updatedAt: new Date(),
                    } as Prisma.BillingCouponUpdateInput,
                });
            })
        );
    },
};
