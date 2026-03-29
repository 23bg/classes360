import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { feeService } from "@/features/fee/feeApi";
import { toAppError } from "@/lib/utils/error";

export async function GET(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const from = req.nextUrl.searchParams.get("from") ?? undefined;
        const to = req.nextUrl.searchParams.get("to") ?? undefined;
        const studentId = req.nextUrl.searchParams.get("studentId") ?? undefined;
        const method = req.nextUrl.searchParams.get("method") ?? undefined;
        const limitRaw = req.nextUrl.searchParams.get("limit");
        const limit = limitRaw ? Number(limitRaw) : undefined;

        const data = await feeService.listPayments(session.instituteId, {
            from,
            to,
            studentId,
            method,
            limit: Number.isFinite(limit) ? limit : undefined,
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

