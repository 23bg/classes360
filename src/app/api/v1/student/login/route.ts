import { NextResponse } from "next/server";
import {
    setStudentAccessTokenCookie,
    setStudentRefreshTokenCookie,
    createStudentAccessToken,
    createStudentRefreshToken,
} from "@/lib/auth/student-tokens";
import { createRouteLogger } from "@/lib/api/route-logger";

/**
 * POST /api/v1/student/login
 * Student login with OTP
 * Body: { email: string, code: string }
 */
export async function POST(req: Request) {
    const routeLog = createRouteLogger("/api/v1/student/login#POST");
    try {
        const { email, code } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Missing email or code" }, { status: 400 });
        }

        routeLog.info("student_login_attempt", { email });

        // TODO: Verify OTP and get student from database
        /*
        const student = await db.student.findUnique({
            where: { email },
        });

        if (!student || student.otpCode !== code || new Date() > student.otpExpiry) {
            routeLog.warn("student_login_failed", { email, reason: "invalid_otp" });
            return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
        }

        // Create tokens
        const accessToken = createStudentAccessToken({
            studentId: student.id,
            instituteId: student.instituteId,
            name: student.name,
        });

        const refreshToken = createStudentRefreshToken({
            studentId: student.id,
            tokenVersion: student.tokenVersion,
        });

        // Set cookies
        await setStudentAccessTokenCookie(accessToken);
        await setStudentRefreshTokenCookie(refreshToken);

        // Clear OTP
        await db.student.update({
            where: { id: student.id },
            data: {
                otpCode: null,
                otpExpiry: null,
            },
        });

        routeLog.info("student_login_succeeded", { studentId: student.id });

        return NextResponse.json({ success: true });
        */

        // Placeholder until DB integration
        return NextResponse.json(
            { error: "Student login not yet fully implemented. Database integration needed." },
            { status: 503 }
        );
    } catch (error) {
        routeLog.error("student_login_error", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
