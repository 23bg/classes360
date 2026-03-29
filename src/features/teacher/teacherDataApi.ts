import { prisma } from "@/lib/db/prisma";

type CreateTeacherInput = {
    instituteId: string;
    name: string;
    subject?: string;
    bio?: string;
};

type UpdateTeacherInput = {
    instituteId: string;
    teacherId: string;
    name?: string;
    subject?: string | null;
    bio?: string | null;
};

export const teacherRepository = {
    create: async (payload: CreateTeacherInput) =>
        prisma.user.create({
            data: {
                instituteId: payload.instituteId,
                email: `teacher.${payload.instituteId}.${Date.now()}.${Math.random().toString(36).slice(2, 10)}@oncampus.local`,
                name: payload.name,
                role: "VIEWER",
                subject: payload.subject,
                bio: payload.bio,
                emailVerified: false,
            },
        }),

    countByInstitute: async (instituteId: string) =>
        prisma.user.count({
            where: {
                instituteId,
                OR: [
                    { subject: { not: null } },
                    { bio: { not: null } },
                ],
            },
        }),

    listByInstitute: async (instituteId: string) =>
        prisma.user.findMany({
            where: {
                instituteId,
                OR: [
                    { subject: { not: null } },
                    { bio: { not: null } },
                ],
            },
            select: {
                id: true,
                instituteId: true,
                name: true,
                subject: true,
                bio: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: "desc" },
        }),

    update: async (payload: UpdateTeacherInput) =>
        prisma.user.updateMany({
            where: { id: payload.teacherId, instituteId: payload.instituteId },
            data: {
                ...(payload.name !== undefined ? { name: payload.name } : {}),
                ...(payload.subject !== undefined ? { subject: payload.subject } : {}),
                ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
            },
        }),

    remove: async (instituteId: string, teacherId: string) =>
        prisma.user.deleteMany({
            where: { id: teacherId, instituteId },
        }),
};
