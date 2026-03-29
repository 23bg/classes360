import { NextRequest, NextResponse } from "next/server";
import { studentService } from "@/server/studentsApi";
import { createStudentSessionToken, setStudentSessionCookie } from "@/lib/auth/student-auth";
import { toAppError } from "@/lib/utils/error";
import { createRouteLogger } from "@/lib/api/route-logger";

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/student-auth/login#POST", req);
    try {
        const body = (await req.json()) as { identifier?: string; password?: string };
        routeLog.info("student_login_started", { identifier: body.identifier ?? null });
        const session = await studentService.loginToPortal(body.identifier ?? "", body.password ?? "");
        const token = createStudentSessionToken(session);
        await setStudentSessionCookie(token);
        routeLog.info("student_login_succeeded", {
            studentId: session.studentId,
            instituteId: session.instituteId,
        });
        return NextResponse.json({ success: true, data: session });
    } catch (error) {
        routeLog.error("student_login_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

