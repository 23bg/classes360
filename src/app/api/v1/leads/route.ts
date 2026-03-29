import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { leadService } from "@/server/leadsApi";
import { toAppError } from "@/lib/utils/error";
import { createRouteLogger } from "@/lib/api/route-logger";

export async function GET(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/leads#GET", req);
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            routeLog.warn("leads_get_unauthorized");
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        routeLog.info("leads_get_started", { userId: session.userId, instituteId: session.instituteId });

        const status = req.nextUrl.searchParams.get("status") ?? undefined;
        const query = req.nextUrl.searchParams.get("query") ?? undefined;
        const from = req.nextUrl.searchParams.get("from") ?? undefined;
        const to = req.nextUrl.searchParams.get("to") ?? undefined;

        const data = await leadService.getLeads(session.instituteId, { status, query, from, to });
        routeLog.info("leads_get_succeeded", { userId: session.userId, instituteId: session.instituteId });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("leads_get_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}


