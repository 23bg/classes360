import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/auth";
import { dashboardService } from "@/features/dashboard/dashboardApi";
import { feeService } from "@/features/fee/feeApi";
import { toAppError } from "@/lib/utils/error";

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get("session_token")?.value;
        if (!token) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Missing session" } },
                { status: 401 }
            );
        }

        const session = verifySessionToken(token);
        if (!session) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Invalid session" } },
                { status: 401 }
            );
        }

        const [metrics, defaulters] = await Promise.all([
            dashboardService.getMetrics(session.instituteId),
            feeService.getDefaulters(session.instituteId),
        ]);

        return NextResponse.json({ success: true, data: { metrics, defaulters } });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

