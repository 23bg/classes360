import { prisma } from "@/lib/db/prisma";

type CreateBatchInput = {
    instituteId: string;
    courseId: string;
    name: string;
    startDate?: Date;
    schedule?: string;
    teacherId?: string;
};

type UpdateBatchInput = {
    name?: string;
    startDate?: Date | null;
    schedule?: string | null;
    teacherId?: string | null;
};

export const batchRepository = {
    create: async (payload: CreateBatchInput) =>
        prisma.batch.create({ data: payload }),

    listByInstitute: async (instituteId: string) =>
        prisma.batch.findMany({
            where: { instituteId },
            orderBy: { createdAt: "desc" },
        }),

    listByCourse: async (instituteId: string, courseId: string) =>
        prisma.batch.findMany({
            where: { instituteId, courseId },
            orderBy: { createdAt: "desc" },
        }),

    findById: async (instituteId: string, batchId: string) =>
        prisma.batch.findFirst({
            where: { id: batchId, instituteId },
        }),

    update: async (instituteId: string, batchId: string, data: UpdateBatchInput) =>
        prisma.batch.updateMany({
            where: { id: batchId, instituteId },
            data,
        }),

    remove: async (instituteId: string, batchId: string) =>
        prisma.batch.deleteMany({
            where: { id: batchId, instituteId },
        }),
};
