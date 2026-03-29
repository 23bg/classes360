import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { toAppError } from "@/lib/utils/error";
import { attendanceService } from "@/features/attendance/attendanceApi";

export async function GET(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const studentId = req.nextUrl.searchParams.get("studentId") ?? undefined;
        const courseId = req.nextUrl.searchParams.get("courseId") ?? undefined;
        const batchId = req.nextUrl.searchParams.get("batchId") ?? undefined;
        const from = req.nextUrl.searchParams.get("from") ?? undefined;
        const to = req.nextUrl.searchParams.get("to") ?? undefined;
        const withSummary = req.nextUrl.searchParams.get("withSummary") === "true";

        if (withSummary && studentId) {
            const data = await attendanceService.getStudentAttendanceSummary(session.instituteId, studentId, {
                courseId,
                batchId,
            });
            return NextResponse.json({ success: true, data });
        }

        const data = await attendanceService.listAttendance(session.instituteId, {
            studentId,
            courseId,
            batchId,
            from,
            to,
        });
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

        const body = (await req.json()) as {
            studentId?: string;
            studentIds?: string[];
            courseId?: string;
            batchId?: string;
            date: string;
            status: "PRESENT" | "ABSENT";
        };

        if (Array.isArray(body.studentIds) && body.studentIds.length > 0) {
            const data = await attendanceService.bulkMarkAttendance({
                instituteId: session.instituteId,
                studentIds: body.studentIds,
                date: body.date,
                status: body.status,
                courseId: body.courseId,
                batchId: body.batchId,
                markedBy: session.userId,
            });
            return NextResponse.json({ success: true, data });
        }

        if (!body.studentId) {
            return NextResponse.json(
                { success: false, error: { code: "STUDENT_REQUIRED", message: "studentId is required" } },
                { status: 400 }
            );
        }

        const data = await attendanceService.markAttendance({
            instituteId: session.instituteId,
            studentId: body.studentId,
            date: body.date,
            status: body.status,
            courseId: body.courseId,
            batchId: body.batchId,
            markedBy: session.userId,
        });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

