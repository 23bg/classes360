import { prisma } from "@/lib/db/prisma";

export const whatsappAccountRepository = {
    getByInstituteId: async (instituteId: string) =>
        prisma.whatsAppAccount.findUnique({ where: { instituteId } }),

    upsertPending: async (instituteId: string, phoneNumber: string) =>
        prisma.whatsAppAccount.upsert({
            where: { instituteId },
            create: {
                instituteId,
                phoneNumber,
                status: "PENDING",
                connectedAt: null,
            },
            update: {
                phoneNumber,
                status: "PENDING",
                phoneNumberId: null,
                businessAccountId: null,
                connectedAt: null,
            },
        }),

    markVerified: async (instituteId: string) =>
        prisma.whatsAppAccount.update({
            where: { instituteId },
            data: { status: "VERIFIED" },
        }),

    activate: async (instituteId: string, input: { phoneNumberId: string; businessAccountId: string }) =>
        prisma.whatsAppAccount.update({
            where: { instituteId },
            data: {
                phoneNumberId: input.phoneNumberId,
                businessAccountId: input.businessAccountId,
                status: "ACTIVE",
                connectedAt: new Date(),
            },
        }),

    disconnect: async (instituteId: string) =>
        prisma.whatsAppAccount.updateMany({
            where: { instituteId },
            data: {
                status: "DISCONNECTED",
            },
        }),

    markFailed: async (instituteId: string) =>
        prisma.whatsAppAccount.updateMany({
            where: { instituteId },
            data: {
                status: "FAILED",
            },
        }),
};
