import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { studentService } from "@/server/studentsApi";
import { toAppError } from "@/lib/utils/error";
import { createRouteLogger } from "@/lib/api/route-logger";

export async function GET() {
    const routeLog = createRouteLogger("/api/v1/students#GET");
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            routeLog.warn("students_get_unauthorized");
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        routeLog.info("students_get_started", { userId: session.userId, instituteId: session.instituteId });
        const data = await studentService.listStudents(session.instituteId);
        routeLog.info("students_get_succeeded", { userId: session.userId, instituteId: session.instituteId });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("students_get_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/students#POST", req);
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            routeLog.warn("students_post_unauthorized");
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!canWriteInstituteData(session.role)) {
            routeLog.warn("students_post_forbidden", { userId: session.userId, instituteId: session.instituteId, role: session.role });
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        routeLog.info("students_post_started", { userId: session.userId, instituteId: session.instituteId });
        const body = (await req.json()) as { name: string; phone: string; email?: string; courseId?: string; batchId?: string; admissionDate?: string; fees?: number };
        const data = await studentService.createStudent({ instituteId: session.instituteId, ...body });
        routeLog.info("students_post_succeeded", { userId: session.userId, instituteId: session.instituteId, studentId: data.id });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("students_post_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

