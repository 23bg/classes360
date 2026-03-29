import { prisma } from "@/lib/db/prisma";

export const notificationPreferenceRepository = {
    getOrCreateByInstituteId: async (instituteId: string) =>
        prisma.instituteNotificationPreference.upsert({
            where: { instituteId },
            create: { instituteId },
            update: {},
        }),

    updateByInstituteId: async (
        instituteId: string,
        payload: Partial<{
            newEnquiryAlert: boolean;
            followUpReminder: boolean;
            leadAssigned: boolean;
            paymentReceived: boolean;
            admissionConfirmed: boolean;
        }>
    ) =>
        prisma.instituteNotificationPreference.upsert({
            where: { instituteId },
            create: {
                instituteId,
                ...payload,
            },
            update: payload,
        }),
};
