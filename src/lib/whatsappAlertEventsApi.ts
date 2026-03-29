import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/utils/logger";
import { sendSystemAlert } from "@/lib/whatsappApi";
import { whatsappIntegrationService } from "@/features/whatsapp/whatsappApi";
import {
    type NotificationEvent,
    getPreferredWhatsAppSenderType,
    supportsWhatsAppForEvent,
} from "@/lib/notifications/event-catalog";

export type WhatsAppAlertEvent = NotificationEvent;

export type PlatformNotificationEvent =
    | "new_enquiry_alert"
    | "follow_up_reminder"
    | "lead_assigned"
    | "payment_received"
    | "admission_confirmed";

const WHATSAPP_SAMPLE_MESSAGE = [
    "Hello World",
    "Welcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.",
    "WhatsApp Business Platform sample message",
].join("\n");

const DEFAULT_TEMPLATE_EVENT_BY_ALERT_EVENT: Partial<Record<WhatsAppAlertEvent, PlatformNotificationEvent>> = {
    LEAD_CREATED: "new_enquiry_alert",
    LEAD_CONVERTED_TO_STUDENT: "admission_confirmed",
    STUDENT_CREATED: "admission_confirmed",
    PAYMENT_RECEIVED: "payment_received",
    STUDENT_PORTAL_CREDENTIALS_CREATED: "follow_up_reminder",
    TEAM_MEMBER_ADDED: "lead_assigned",
    INSTITUTE_ONBOARDING_COMPLETED: "follow_up_reminder",
    INSTITUTE_PROFILE_UPDATED: "follow_up_reminder",
};

const PLATFORM_TEMPLATE_RENDERERS: Record<
    PlatformNotificationEvent,
    (vars: { studentName: string; courseName: string; instituteName: string }) => string
> = {
    new_enquiry_alert: ({ studentName, courseName, instituteName }) =>
        `New enquiry alert: ${studentName} has enquired for ${courseName} at ${instituteName}.`,
    follow_up_reminder: ({ studentName, courseName, instituteName }) =>
        `Follow-up reminder: Please follow up with ${studentName} for ${courseName} at ${instituteName}.`,
    lead_assigned: ({ studentName, courseName, instituteName }) =>
        `Lead assigned: ${studentName} (${courseName}) has been assigned in ${instituteName}.`,
    payment_received: ({ studentName, courseName, instituteName }) =>
        `Payment received: ${studentName} has made a payment for ${courseName} at ${instituteName}.`,
    admission_confirmed: ({ studentName, courseName, instituteName }) =>
        `Admission confirmed: ${studentName} is now admitted in ${courseName} at ${instituteName}.`,
};

const normalizePhoneForWhatsApp = (phone?: string | null): string | null => {
    if (!phone) return null;

    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return digits;

    return null;
};

const resolveInstituteDestination = async (instituteId: string): Promise<string | null> => {
    const institute = await prisma.institute.findUnique({
        where: { id: instituteId },
        select: { whatsapp: true, phone: true },
    });

    return normalizePhoneForWhatsApp(institute?.whatsapp) ?? normalizePhoneForWhatsApp(institute?.phone);
};

export const sendEventBasedWhatsAppAlert = async (input: {
    event: WhatsAppAlertEvent;
    instituteId: string;
    message: string;
    phoneNumber?: string | null;
    templateEvent?: PlatformNotificationEvent;
    templateVariables?: {
        student_name?: string;
        course_name?: string;
        institute_name?: string;
    };
}): Promise<{ sent: boolean; blocked: boolean; billable: boolean; reason?: string } | null> => {
    if (!supportsWhatsAppForEvent(input.event)) {
        logger.info({
            event: "whatsapp_event_alert_skipped_channel_not_enabled",
            alertEvent: input.event,
            instituteId: input.instituteId,
        });
        return null;
    }

    const destination = normalizePhoneForWhatsApp(input.phoneNumber) ?? (await resolveInstituteDestination(input.instituteId));

    if (!destination) {
        logger.info({
            event: "whatsapp_event_alert_skipped_no_destination",
            alertEvent: input.event,
            instituteId: input.instituteId,
        });
        return null;
    }

    try {
        const templateEvent =
            input.templateEvent ?? DEFAULT_TEMPLATE_EVENT_BY_ALERT_EVENT[input.event] ?? "follow_up_reminder";
        const isEnabled = await whatsappIntegrationService.isNotificationEnabled(input.instituteId, templateEvent);
        const senderType = getPreferredWhatsAppSenderType(input.event) ?? "ONCAMPUS_SYSTEM_NUMBER";

        if (!isEnabled) {
            logger.info({
                event: "whatsapp_event_alert_skipped_disabled",
                alertEvent: input.event,
                templateEvent,
                instituteId: input.instituteId,
            });
            return { sent: false, blocked: true, billable: false, reason: "NOTIFICATION_DISABLED" };
        }

        const institute = await prisma.institute.findUnique({
            where: { id: input.instituteId },
            select: { name: true },
        });

        const renderedMessage = PLATFORM_TEMPLATE_RENDERERS[templateEvent]({
            studentName: input.templateVariables?.student_name ?? "Student",
            courseName: input.templateVariables?.course_name ?? "course",
            instituteName: input.templateVariables?.institute_name ?? institute?.name ?? "your institute",
        });

        // Current behavior (event-specific dynamic message):
        // const result = await sendSystemAlert(input.instituteId, destination, input.message);
        const result = await sendSystemAlert(
            input.instituteId,
            destination,
            renderedMessage || input.message || WHATSAPP_SAMPLE_MESSAGE,
            senderType
        );

        logger.info({
            event: "whatsapp_event_alert_dispatched",
            alertEvent: input.event,
            templateEvent,
            senderType,
            instituteId: input.instituteId,
            destination,
            sent: result.sent,
            blocked: result.blocked,
            billable: result.billable,
            reason: result.reason,
        });

        return result;
    } catch (error) {
        logger.error({
            event: "whatsapp_event_alert_failed",
            alertEvent: input.event,
            instituteId: input.instituteId,
            destination,
            error,
        });
        return null;
    }
};

