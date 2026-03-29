import { NextResponse } from "next/server";
import { readStudentAccessTokenFromCookie, clearStudentAuthCookies } from "@/lib/auth/student-tokens";
import { createRouteLogger } from "@/lib/api/route-logger";

/**
 * POST /api/v1/student/logout
 * Student logout
 */
export async function POST() {
    const routeLog = createRouteLogger("/api/v1/student/logout#POST");
    try {
        routeLog.info("student_logout_started");

        // Read access token to get studentId
        const session = await readStudentAccessTokenFromCookie();

        // Clear student auth cookies
        await clearStudentAuthCookies();

        // TODO: Increment student.tokenVersion to revoke all refresh tokens
        /*
        if (session) {
            await db.student.update({
                where: { id: session.studentId },
                data: { tokenVersion: { increment: 1 } },
            });
        }
        */

        routeLog.info("student_logout_succeeded", { studentId: session?.studentId });

        return NextResponse.json({
            success: true,
            data: { loggedOut: true },
        });
    } catch (error) {
        routeLog.error("student_logout_failed", error);
        return NextResponse.json({ error: "Logout failed" }, { status: 500 });
    }
}
