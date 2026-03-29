import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/utils/error";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";

const noteInputSchema = z.object({
    instituteId: z.string().min(1),
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().max(4000).optional(),
    fileUrl: z.string().trim().url().max(500).optional(),
    courseId: z.string().optional(),
    batchId: z.string().optional(),
    createdBy: z.string().optional(),
});

export const noteService = {
    async listNotes(
        instituteId: string,
        filters?: { courseId?: string; batchId?: string; page?: number; pageSize?: number }
    ) {
        const page = Math.max(1, filters?.page ?? 1);
        const pageSize = Math.min(100, Math.max(1, filters?.pageSize ?? 20));

        const where = {
            instituteId,
            deletedAt: null,
            ...(filters?.courseId ? { courseId: filters.courseId } : {}),
            ...(filters?.batchId ? { batchId: filters.batchId } : {}),
        };

        const [items, total] = await Promise.all([
            prisma.note.findMany({
                where,
                orderBy: { createdAt: "desc" },
                skip: (page - 1) * pageSize,
                take: pageSize,
            }),
            prisma.note.count({ where }),
        ]);

        return {
            items,
            total,
            page,
            pageSize,
            totalPages: Math.max(1, Math.ceil(total / pageSize)),
        };
    },

    async createNote(payload: unknown) {
        const input = noteInputSchema.parse(payload);

        if (!input.courseId && !input.batchId) {
            throw new AppError("Either courseId or batchId is required", 400, "NOTE_SCOPE_REQUIRED");
        }

        if (input.courseId) {
            const course = await prisma.course.findFirst({ where: { id: input.courseId, instituteId: input.instituteId } });
            if (!course) {
                throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
            }
        }

        if (input.batchId) {
            const batch = await prisma.batch.findFirst({ where: { id: input.batchId, instituteId: input.instituteId } });
            if (!batch) {
                throw new AppError("Batch not found", 404, "BATCH_NOT_FOUND");
            }
        }

        const note = await prisma.note.create({
            data: {
                instituteId: input.instituteId,
                title: input.title,
                description: input.description,
                fileUrl: input.fileUrl,
                courseId: input.courseId,
                batchId: input.batchId,
                createdBy: input.createdBy,
            },
        });

        await eventDispatcherService.dispatch({
            event: "COURSE_NOTE_PUBLISHED",
            instituteId: input.instituteId,
            message: `New note published: ${note.title}`,
            link: "/courses",
            metadata: {
                noteId: note.id,
                courseId: note.courseId,
                batchId: note.batchId,
            },
        });

        return note;
    },
};
