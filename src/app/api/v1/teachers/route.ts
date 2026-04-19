import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { teacherService } from "@/features/teacher/teacherApi";
import { toAppError } from "@/lib/utils/error";

const createTeacherSchema = z.object({
    name: z.string().trim().min(2).max(80),
    subject: z.string().trim().max(120).optional(),
    bio: z.string().trim().max(1024).optional(),
}).strict();

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const data = await teacherService.listTeachers(session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!canWriteInstituteData(session.role)) {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        const body = createTeacherSchema.parse(await req.json());
        const data = await teacherService.createTeacher({ instituteId: session.instituteId, ...body });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

