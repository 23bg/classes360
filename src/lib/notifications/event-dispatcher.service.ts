import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/utils/logger";
import {
    hasChannelForEvent,
    type NotificationChannel,
    type NotificationEvent,
    getEventAudiences,
} from "@/lib/notifications/event-catalog";
import { resolveNotificationContent } from "@/lib/notifications/notification-content";
import { notificationStoreService } from "@/lib/notifications/notification-store.service";
import { sendEventBasedWhatsAppAlert, type PlatformNotificationEvent } from "@/lib/whatsappAlertEventsApi";
import { mailerService } from "@/lib/mailerApi";

export type DispatchEventInput = {
    event: NotificationEvent;
    instituteId: string;
    studentId?: string;
    studentIds?: string[];
    batchId?: string | null;
    title?: string;
    message?: string;
    link?: string;
    metadata?: Record<string, unknown>;
    whatsappPhoneNumber?: string | null;
    templateEvent?: PlatformNotificationEvent;
    templateVariables?: {
        student_name?: string;
        course_name?: string;
        institute_name?: string;
    };
    emailTo?: string[];
};

const resolveStudentTargets = async (input: DispatchEventInput): Promise<string[]> => {
    if (input.studentIds && input.studentIds.length > 0) return input.studentIds;
    if (input.studentId) return [input.studentId];

    const where = input.batchId
        ? { instituteId: input.instituteId, batchId: input.batchId, deletedAt: null as Date | null }
        : { instituteId: input.instituteId, deletedAt: null as Date | null };

    const rows = await prisma.student.findMany({
        where,
        select: { id: true },
        take: 1000,
    });

    return rows.map((row) => row.id);
};

const resolveEmails = async (input: DispatchEventInput): Promise<string[]> => {
    if (input.emailTo && input.emailTo.length > 0) {
        return input.emailTo.filter(Boolean);
    }

    const audiences = getEventAudiences(input.event, "EMAIL");
    if (audiences.includes("STUDENT")) {
        const studentIds = await resolveStudentTargets(input);
        if (studentIds.length === 0) return [];

        const students = await prisma.student.findMany({
            where: { id: { in: studentIds } },
            select: { email: true },
        });

        return students
            .map((row) => row.email?.trim())
            .filter((email): email is string => Boolean(email));
    }

    if (audiences.includes("INSTITUTE_OWNER") || audiences.includes("INSTITUTE_USERS")) {
        const users = await prisma.user.findMany({
            where: {
                instituteId: input.instituteId,
                deletedAt: null,
                ...(audiences.includes("INSTITUTE_OWNER") ? { role: "OWNER" } : {}),
            },
            select: { email: true },
            take: 50,
        });

        return users.map((row) => row.email).filter(Boolean);
    }

    return [];
};

const dispatchChannel = async (
    channel: NotificationChannel,
    input: DispatchEventInput,
    content: { title: string; message: string }
): Promise<void> => {
    if (channel === "IN_APP_ADMIN") {
        await notificationStoreService.createAdminNotification({
            instituteId: input.instituteId,
            eventType: input.event,
            title: content.title,
            message: content.message,
            link: input.link,
            metadata: input.metadata,
        });
        return;
    }

    if (channel === "IN_APP_STUDENT_PORTAL") {
        const studentIds = await resolveStudentTargets(input);
        await notificationStoreService.createStudentNotifications({
            studentIds,
            eventType: input.event,
            title: content.title,
            message: content.message,
            link: input.link,
            metadata: input.metadata,
        });
        return;
    }

    if (channel === "WHATSAPP_ONCAMPUS" || channel === "WHATSAPP_INSTITUTE") {
        await sendEventBasedWhatsAppAlert({
            event: input.event,
            instituteId: input.instituteId,
            message: content.message,
            phoneNumber: input.whatsappPhoneNumber,
            templateEvent: input.templateEvent,
            templateVariables: input.templateVariables,
        });
        return;
    }

    if (channel === "EMAIL") {
        const emails = await resolveEmails(input);
        if (emails.length === 0) return;

        await Promise.all(
            emails.map((email) =>
                mailerService.sendNotificationEmail({
                    to: email,
                    subject: content.title,
                    text: content.message,
                    html: `<p>${content.message}</p>`,
                })
            )
        );
    }
};

export const eventDispatcherService = {
    async dispatch(input: DispatchEventInput): Promise<void> {
        const content = resolveNotificationContent({
            event: input.event,
            title: input.title,
            message: input.message,
        });

        const channels: NotificationChannel[] = [
            "IN_APP_ADMIN",
            "IN_APP_STUDENT_PORTAL",
            "WHATSAPP_ONCAMPUS",
            "WHATSAPP_INSTITUTE",
            "EMAIL",
        ];

        for (const channel of channels) {
            if (!hasChannelForEvent(input.event, channel)) continue;

            try {
                await dispatchChannel(channel, input, content);
            } catch (error) {
                logger.error({
                    event: "notification_channel_dispatch_failed",
                    notificationEvent: input.event,
                    channel,
                    instituteId: input.instituteId,
                    error,
                });
            }
        }
    },
};

