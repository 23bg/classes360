import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { AppError } from "@/lib/utils/error";
import { eventDispatcherService } from "@/lib/notifications/event-dispatcher.service";

const courseInputSchema = z.object({
    instituteId: z.string().min(1),
    name: z.string().trim().min(2, "Course name must be at least 2 characters").max(120, "Course name cannot exceed 120 characters"),
    banner: z.string().trim().max(2048).url().optional().or(z.literal("")),
    duration: z.string().trim().max(120).optional(),
    defaultFees: z.number().min(0).optional(),
    description: z.string().trim().max(1024).optional(),
});

type UpdateCourseInput = {
    name?: string;
    banner?: string | null;
    duration?: string | null;
    defaultFees?: number | null;
    description?: string | null;
};

const createCourseRecord = async (payload: {
    instituteId: string;
    name: string;
    banner?: string;
    duration?: string;
    defaultFees?: number;
    description?: string;
}) =>
    prisma.course.create({ data: payload });

const listCoursesByInstitute = async (instituteId: string) =>
    prisma.course.findMany({
        where: { instituteId },
        orderBy: { createdAt: "desc" },
    });

const findCourseById = async (instituteId: string, courseId: string) =>
    prisma.course.findFirst({
        where: { id: courseId, instituteId },
    });

const updateCourseRecord = async (instituteId: string, courseId: string, data: UpdateCourseInput) =>
    prisma.course.updateMany({
        where: { id: courseId, instituteId },
        data,
    });

const deleteCourseRecord = async (instituteId: string, courseId: string) =>
    prisma.course.deleteMany({
        where: { id: courseId, instituteId },
    });

export const courseService = {
    async createCourse(payload: unknown) {
        const input = courseInputSchema.parse(payload);
        const course = await createCourseRecord(input);

        await eventDispatcherService.dispatch({
            event: "COURSE_CREATED",
            instituteId: input.instituteId,
            message: `Course created: ${course.name}.`,
            link: `/courses/${course.id}`,
            metadata: { courseId: course.id },
        });

        return course;
    },

    async updateCourse(instituteId: string, courseId: string, payload: UpdateCourseInput) {
        if (payload.name !== undefined) {
            z.string().trim().min(2).max(120).parse(payload.name);
        }
        if (payload.banner !== undefined && payload.banner !== null && payload.banner !== "") {
            z.string().trim().max(2048).url().parse(payload.banner);
        }
        if (payload.duration !== undefined && payload.duration !== null) {
            z.string().trim().max(120).parse(payload.duration);
        }
        if (payload.description !== undefined && payload.description !== null) {
            z.string().trim().max(1024).parse(payload.description);
        }

        const result = await updateCourseRecord(instituteId, courseId, {
            ...payload,
            banner: payload.banner === "" ? null : payload.banner,
        });

        await eventDispatcherService.dispatch({
            event: "COURSE_UPDATED",
            instituteId,
            message: "Course details updated.",
            link: `/courses/${courseId}`,
            metadata: { courseId },
        });

        return result;
    },

    async deleteCourse(instituteId: string, courseId: string) {
        await deleteCourseRecord(instituteId, courseId);
        return { success: true };
    },

    async getCourses(instituteId: string) {
        return listCoursesByInstitute(instituteId);
    },

    async getCourseById(instituteId: string, courseId: string) {
        const course = await findCourseById(instituteId, courseId);
        if (!course) {
            throw new AppError("Course not found", 404, "COURSE_NOT_FOUND");
        }
        return course;
    },
};
