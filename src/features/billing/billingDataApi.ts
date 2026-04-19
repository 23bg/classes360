import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export const billingRepository = {
    countOutboundAlertsInWindow: async (instituteId: string, start: Date, end: Date) =>
        prisma.whatsAppMessage.count({
            where: {
                instituteId,
                direction: "OUTBOUND",
                status: "SENT",
                createdAt: {
                    gte: start,
                    lt: end,
                },
            },
        }),

    upsertMonthlyUsage: async (instituteId: string, month: number, year: number, conversationCount: number, dailyConversationCount: number) =>
        prisma.monthlyUsage.upsert({
            where: {
                instituteId_month_year: {
                    instituteId,
                    month,
                    year,
                },
            },
            create: {
                instituteId,
                month,
                year,
                conversationCount,
                dailyConversationCount,
            },
            update: {
                conversationCount,
                dailyConversationCount,
            },
        }),

    upsertInvoice: async (input: {
        instituteId: string;
        month: number;
        year: number;
        periodStart: Date;
        periodEnd: Date;
        planCode: string;
        billingInterval: "MONTHLY" | "YEARLY";
        planCharge: number;
        includedAlerts: number;
        alertsUsed: number;
        extraAlerts: number;
        extraAlertRate: number;
        usageCharge: number;
        totalAmount: number;
        dueDate: Date;
        autopayEnabled: boolean;
        metadata?: Record<string, unknown>;
        couponCode?: string | null;
        originalAmount?: number | null;
        discountAmount?: number | null;
        finalAmount?: number | null;
    }) =>
        prisma.billingInvoice.upsert({
            where: {
                instituteId_month_year: {
                    instituteId: input.instituteId,
                    month: input.month,
                    year: input.year,
                },
            },
            create: {
                instituteId: input.instituteId,
                month: input.month,
                year: input.year,
                periodStart: input.periodStart,
                periodEnd: input.periodEnd,
                planCode: input.planCode,
                billingInterval: input.billingInterval,
                planCharge: input.planCharge,
                includedAlerts: input.includedAlerts,
                alertsUsed: input.alertsUsed,
                extraAlerts: input.extraAlerts,
                extraAlertRate: input.extraAlertRate,
                usageCharge: input.usageCharge,
                totalAmount: input.totalAmount,
                couponCode: input.couponCode ?? null,
                originalAmount: input.originalAmount ?? null,
                discountAmount: input.discountAmount ?? null,
                finalAmount: input.finalAmount ?? null,
                status: "PENDING",
                issuedAt: new Date(),
                dueDate: input.dueDate,
                autopayEnabled: input.autopayEnabled,
                metadata: (input.metadata ?? null) as Prisma.InputJsonValue,
            },
            update: {
                periodStart: input.periodStart,
                periodEnd: input.periodEnd,
                planCode: input.planCode,
                billingInterval: input.billingInterval,
                planCharge: input.planCharge,
                includedAlerts: input.includedAlerts,
                alertsUsed: input.alertsUsed,
                extraAlerts: input.extraAlerts,
                extraAlertRate: input.extraAlertRate,
                usageCharge: input.usageCharge,
                totalAmount: input.totalAmount,
                couponCode: input.couponCode ?? null,
                originalAmount: input.originalAmount ?? null,
                discountAmount: input.discountAmount ?? null,
                finalAmount: input.finalAmount ?? null,
                dueDate: input.dueDate,
                autopayEnabled: input.autopayEnabled,
                metadata: (input.metadata ?? null) as Prisma.InputJsonValue,
                status: "PENDING",
                issuedAt: new Date(),
                paidAt: null,
                paymentAttempts: 0,
                lastAttemptAt: null,
                nextRetryAt: null,
                lastFailureReason: null,
            },
        }),

    listInvoices: async (instituteId: string, take = 12) =>
        prisma.billingInvoice.findMany({
            where: { instituteId },
            orderBy: [{ year: "desc" }, { month: "desc" }],
            take,
        }),

    markInvoicePaidByPaymentLinkId: async (paymentLinkId: string) =>
        prisma.billingInvoice.updateMany({
            where: {
                razorpayPaymentLinkId: paymentLinkId,
            },
            data: {
                status: "PAID",
                paidAt: new Date(),
            },
        }),

    markInvoicePaidById: async (invoiceId: string) =>
        prisma.billingInvoice.update({
            where: { id: invoiceId },
            data: {
                status: "PAID",
                paidAt: new Date(),
            },
        }),

    markOverdueInvoices: async (now: Date) =>
        prisma.billingInvoice.updateMany({
            where: {
                status: "PENDING",
                dueDate: { lt: now },
            },
            data: {
                status: "OVERDUE",
            },
        }),

    listPendingRetryInvoices: async (now: Date, maxAttempts: number, take = 100) =>
        prisma.billingInvoice.findMany({
            where: {
                status: "PENDING",
                paymentAttempts: { lt: maxAttempts },
                OR: [{ nextRetryAt: null }, { nextRetryAt: { lte: now } }],
            },
            orderBy: [{ dueDate: "asc" }, { updatedAt: "asc" }],
            take,
        }),

    getLatestInvoice: async (instituteId: string) =>
        prisma.billingInvoice.findFirst({
            where: { instituteId },
            orderBy: [{ year: "desc" }, { month: "desc" }],
        }),

    findInvoiceById: async (id: string) =>
        prisma.billingInvoice.findUnique({ where: { id } }),

    attachPaymentLink: async (invoiceId: string, paymentLink: { id?: string; short_url?: string; reference_id?: string }) =>
        prisma.billingInvoice.update({
            where: { id: invoiceId },
            data: {
                razorpayPaymentLinkId: paymentLink.id ?? null,
                paymentLinkUrl: paymentLink.short_url ?? null,
                metadata: paymentLink.reference_id ? { referenceId: paymentLink.reference_id } : undefined,
            },
        }),

    hasOverdueInvoice: async (instituteId: string) => {
        const overdue = await prisma.billingInvoice.findFirst({
            where: {
                instituteId,
                status: "OVERDUE",
            },
            select: { id: true },
        });

        return Boolean(overdue);
    },

    hasExhaustedPendingInvoice: async (instituteId: string, maxAttempts: number) => {
        const exhausted = await prisma.billingInvoice.findFirst({
            where: {
                instituteId,
                status: "PENDING",
                paymentAttempts: { gte: maxAttempts },
                nextRetryAt: null,
            },
            select: { id: true },
        });

        return Boolean(exhausted);
    },

    recordAutopayAttempt: async (invoiceId: string, input: { nextRetryAt: Date | null; reason?: string }) =>
        prisma.billingInvoice.update({
            where: { id: invoiceId },
            data: {
                paymentAttempts: { increment: 1 },
                lastAttemptAt: new Date(),
                nextRetryAt: input.nextRetryAt,
                lastFailureReason: input.reason ?? "AUTOPAY_ATTEMPT_PENDING_CONFIRMATION",
                status: "PENDING",
            },
        }),
};
