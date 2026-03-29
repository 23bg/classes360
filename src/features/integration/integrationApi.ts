import { prisma } from "@/lib/db/prisma";
import { env } from "@/lib/config/env";

const getEmailStatus = () => {
    const connected = Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASS && env.SMTP_FROM);
    return connected ? "CONNECTED" : "DISCONNECTED";
};

const getRazorpayStatus = () => {
    const connected = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
    return connected ? "CONNECTED" : "DISCONNECTED";
};

export const integrationService = {
    async syncAndList(instituteId: string) {
        const whatsappAccount = await prisma.whatsAppAccount.findUnique({
            where: { instituteId },
            select: { status: true, phoneNumber: true, phoneNumberId: true, businessAccountId: true },
        });

        await Promise.all([
            prisma.integration.upsert({
                where: {
                    instituteId_provider: {
                        instituteId,
                        provider: "WHATSAPP",
                    },
                },
                create: {
                    instituteId,
                    provider: "WHATSAPP",
                    status: whatsappAccount?.status === "ACTIVE" ? "CONNECTED" : "DISCONNECTED",
                    config: whatsappAccount
                        ? {
                            connectedNumber: whatsappAccount.phoneNumber,
                            phoneNumberId: whatsappAccount.phoneNumberId,
                            businessAccountId: whatsappAccount.businessAccountId,
                        }
                        : null,
                },
                update: {
                    status: whatsappAccount?.status === "ACTIVE" ? "CONNECTED" : "DISCONNECTED",
                    config: whatsappAccount
                        ? {
                            connectedNumber: whatsappAccount.phoneNumber,
                            phoneNumberId: whatsappAccount.phoneNumberId,
                            businessAccountId: whatsappAccount.businessAccountId,
                        }
                        : null,
                },
            }),
            prisma.integration.upsert({
                where: {
                    instituteId_provider: {
                        instituteId,
                        provider: "EMAIL",
                    },
                },
                create: {
                    instituteId,
                    provider: "EMAIL",
                    status: getEmailStatus(),
                    config: {
                        provider: "SMTP",
                        otpEmailEnabled: env.OTP_EMAIL_ENABLED,
                    },
                },
                update: {
                    status: getEmailStatus(),
                    config: {
                        provider: "SMTP",
                        otpEmailEnabled: env.OTP_EMAIL_ENABLED,
                    },
                },
            }),
            prisma.integration.upsert({
                where: {
                    instituteId_provider: {
                        instituteId,
                        provider: "RAZORPAY",
                    },
                },
                create: {
                    instituteId,
                    provider: "RAZORPAY",
                    status: getRazorpayStatus(),
                    config: {
                        keyIdConfigured: Boolean(env.RAZORPAY_KEY_ID),
                    },
                },
                update: {
                    status: getRazorpayStatus(),
                    config: {
                        keyIdConfigured: Boolean(env.RAZORPAY_KEY_ID),
                    },
                },
            }),
        ]);

        return prisma.integration.findMany({
            where: { instituteId },
            orderBy: { provider: "asc" },
        });
    },
};
