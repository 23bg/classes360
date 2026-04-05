import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";
import { logger } from "@/lib/utils/logger";
import { prisma } from "@/lib/db/prisma";
import { PLAN_CONFIG, PlanType } from "@/config/plans";
import { subscriptionService } from "@/features/subscription/subscriptionApi";
import { billingService } from "@/features/billing/billingApi";
import { billingRepository } from "@/features/billing/billingDataApi";
import { whatsappIntegrationService } from "@/features/whatsapp/whatsappApi";
import type { WhatsAppSenderType } from "@/lib/notifications/event-catalog";

const resolveApiVersion = () => env.WHATSAPP_API_VERSION || "v19.0";

const getApiUrl = (phoneNumberId?: string | null) => {
    const senderPhoneNumberId = phoneNumberId ?? env.WHATSAPP_PHONE_NUMBER_ID;
    if (!senderPhoneNumberId) {
        throw new AppError("WHATSAPP_PHONE_NUMBER_ID is not configured", 500, "WHATSAPP_CONFIG_MISSING");
    }

    return `https://graph.facebook.com/${resolveApiVersion()}/${senderPhoneNumberId}/messages`;
};

const getAuthHeader = () => {
    if (!env.WHATSAPP_ACCESS_TOKEN) {
        throw new AppError("WHATSAPP_ACCESS_TOKEN is not configured", 500, "WHATSAPP_CONFIG_MISSING");
    }

    return {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
    };
};

type WhatsAppApiResult = {
    messages?: Array<{ id?: string }>;
    error?: {
        message?: string;
        type?: string;
        code?: number;
        error_data?: {
            details?: string;
        };
        fbtrace_id?: string;
    };
};

const sendWhatsAppPayload = async (
    payload: Record<string, unknown>,
    phoneNumberId?: string | null
): Promise<WhatsAppApiResult> => {
    const response = await fetch(getApiUrl(phoneNumberId), {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(payload),
    });

    const data = (await response.json()) as WhatsAppApiResult;

    if (!response.ok) {
        logger.error({ event: "whatsapp_api_request_failed", status: response.status, data });
        throw new AppError(
            data.error?.message || "WhatsApp API request failed",
            502,
            "WHATSAPP_API_ERROR",
            data
        );
    }

    return data;
};

export const sendWhatsAppText = async (phone: string, message: string): Promise<WhatsAppApiResult> =>
    sendWhatsAppPayload({
        messaging_product: "whatsapp",
        to: "918421334187",
        type: "template",
        template: {
            name: "hello_world",
            language: {
                code: "en_US"
            }
        }
    });

export const sendWhatsAppTemplate = async (
    phone: string,
    templateName: string,
    bodyParameters: string[],
    languageCode = "en"
): Promise<WhatsAppApiResult> =>
    sendWhatsAppPayload({
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
            name: templateName,
            language: { code: languageCode },
            components: [
                {
                    type: "body",
                    parameters: bodyParameters.map((text) => ({
                        type: "text",
                        text,
                    })),
                },
            ],
        },
    });

type SendSystemAlertResult = {
    sent: boolean;
    blocked: boolean;
    billable: boolean;
    reason?: string;
};

const toStoredPlanType = (storedPlanType: string | null | undefined, userLimit?: number | null): PlanType => {
    if (storedPlanType === "STARTER" || storedPlanType === "GROWTH" || storedPlanType === "SCALE") {
        return storedPlanType;
    }

    if (storedPlanType === "SOLO") {
        return "STARTER";
    }

    if (storedPlanType === "TEAM") {
        return (userLimit ?? 0) >= (PLAN_CONFIG.SCALE.userLimit ?? Number.MAX_SAFE_INTEGER) ? "SCALE" : "GROWTH";
    }

    return "STARTER";
};

const getMonthWindow = (now = new Date()) => ({
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)),
});

const getDayWindow = (now = new Date()) => ({
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)),
});

/**
 * Send a system-generated operational alert to a phone number.
 *
 * Conversation window logic:
 *   - A 24-hour conversation window is tracked per phone number.
 *   - Multiple messages within the same window count as ONE conversation.
 *   - Daily and monthly limits are enforced per plan.
 *   - Messages over the monthly limit are allowed but flagged as billable extras.
 *   - Messages over the daily limit are blocked to prevent overuse.
 */
export const sendSystemAlert = async (
    instituteId: string,
    phoneNumber: string,
    message: string,
    senderType: WhatsAppSenderType = "CLASSES360_SYSTEM_NUMBER"
): Promise<SendSystemAlertResult> => {
    try {
        const policy = await billingService.getOperationalPolicy(instituteId);
        if (!policy.canSendAlerts) {
            return { sent: false, blocked: true, billable: false, reason: "ALERTS_BLOCKED_BY_BILLING_POLICY" };
        }

        const subscription = await subscriptionService.getSubscription(instituteId);
        const planType = toStoredPlanType(subscription.planType, subscription.userLimit);
        const plan = PLAN_CONFIG[planType];

        const now = new Date();
        const monthWindow = getMonthWindow(now);
        const dayWindow = getDayWindow(now);

        const [monthCount, dayCount] = await Promise.all([
            prisma.whatsAppMessage.count({
                where: {
                    instituteId,
                    direction: "OUTBOUND",
                    status: "SENT",
                    createdAt: { gte: monthWindow.start, lt: monthWindow.end },
                },
            }),
            prisma.whatsAppMessage.count({
                where: {
                    instituteId,
                    direction: "OUTBOUND",
                    status: "SENT",
                    createdAt: { gte: dayWindow.start, lt: dayWindow.end },
                },
            }),
        ]);

        if (dayCount >= plan.whatsappDailyLimit) {
            return { sent: false, blocked: true, billable: false, reason: "DAILY_ALERT_LIMIT_REACHED" };
        }

        const nextMonthCount = monthCount + 1;
        const nextDayCount = dayCount + 1;
        const billable = nextMonthCount > plan.whatsappMonthlyLimit;

        const sender =
            senderType === "INSTITUTE_WHATSAPP_NUMBER"
                ? await whatsappIntegrationService.getSenderRouting(instituteId)
                : {
                    mode: "CLASSES360_SHARED" as const,
                    senderPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID ?? null,
                    fallbackPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID ?? null,
                };

        // Send the message as approved template for now.
        // Previous dynamic text mode kept below for quick restore after template updates.
        let result: WhatsAppApiResult;
        let senderMode = sender.mode;

        try {
            result = await sendWhatsAppPayload(
                {
                    messaging_product: "whatsapp",
                    to: phoneNumber,
                    type: "template",
                    template: {
                        name: "hello_world",
                        language: {
                            code: "en_US",
                        },
                    },
                },
                sender.senderPhoneNumberId
            );
        } catch (error) {
            if (sender.mode !== "INSTITUTE_CUSTOM" || !sender.fallbackPhoneNumberId) {
                throw error;
            }

            // Keep delivery resilient by falling back to shared sender when custom sender fails.
            await whatsappIntegrationService.markSenderFailure(instituteId);
            result = await sendWhatsAppPayload(
                {
                    messaging_product: "whatsapp",
                    to: phoneNumber,
                    type: "template",
                    template: {
                        name: "hello_world",
                        language: {
                            code: "en_US",
                        },
                    },
                },
                sender.fallbackPhoneNumberId
            );
            senderMode = "CLASSES360_SHARED";
        }
        // const result = await sendWhatsAppPayload({
        //     messaging_product: "whatsapp",
        //     to: phoneNumber,
        //     type: "text",
        //     text: { body: message },
        // });

        await prisma.whatsAppMessage.create({
            data: {
                instituteId,
                phone: phoneNumber,
                message,
                direction: "OUTBOUND",
                status: "SENT",
                providerId: result.messages?.[0]?.id ?? null,
                payload: result,
                provider: senderMode === "INSTITUTE_CUSTOM" ? "INSTITUTE_WHATSAPP" : "META_WHATSAPP_CLOUD",
            },
        });

        await billingRepository.upsertMonthlyUsage(
            instituteId,
            monthWindow.start.getUTCMonth() + 1,
            monthWindow.start.getUTCFullYear(),
            nextMonthCount,
            nextDayCount
        );

        logger.info({
            event: "whatsapp_system_alert_sent",
            instituteId,
            phoneNumber,
        });

        return { sent: true, blocked: false, billable };
    } catch (error) {
        logger.error({
            event: "whatsapp_system_alert_failed",
            instituteId,
            phoneNumber,
            error,
        });
        return { sent: false, blocked: false, billable: false, reason: "SEND_FAILED" };
    }
};

