import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type { NotificationEvent } from "@/lib/notifications/event-catalog";

export const notificationStoreService = {
    async createAdminNotification(input: {
        instituteId: string;
        eventType: NotificationEvent;
        title: string;
        message: string;
        link?: string;
        metadata?: Record<string, unknown>;
    }) {
        return prisma.adminNotification.create({
            data: {
                instituteId: input.instituteId,
                eventType: input.eventType,
                title: input.title,
                message: input.message,
                link: input.link,
                metadata: (input.metadata ?? null) as Prisma.InputJsonValue,
            },
        });
    },

    async createStudentNotifications(input: {
        studentIds: string[];
        eventType: NotificationEvent;
        title: string;
        message: string;
        link?: string;
        metadata?: Record<string, unknown>;
    }) {
        if (input.studentIds.length === 0) {
            return { count: 0 };
        }

        const result = await prisma.studentNotification.createMany({
            data: input.studentIds.map((studentId) => ({
                studentId,
                eventType: input.eventType,
                title: input.title,
                message: input.message,
                link: input.link,
                metadata: (input.metadata ?? null) as Prisma.InputJsonValue,
            })),
        });

        return { count: result.count };
    },

    async listAdminNotifications(instituteId: string, limit = 50) {
        return prisma.adminNotification.findMany({
            where: { instituteId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    },

    async markAdminNotificationRead(instituteId: string, notificationId: string, read: boolean) {
        const result = await prisma.adminNotification.updateMany({
            where: {
                id: notificationId,
                instituteId,
            },
            data: { read },
        });

        return { updated: result.count > 0 };
    },

    async listStudentNotifications(studentId: string, limit = 50) {
        return prisma.studentNotification.findMany({
            where: { studentId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });
    },

    async markStudentNotificationRead(studentId: string, notificationId: string, read: boolean) {
        const result = await prisma.studentNotification.updateMany({
            where: {
                id: notificationId,
                studentId,
            },
            data: { read },
        });

        return { updated: result.count > 0 };
    },
};
