import { NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { leadService } from "@/server/leadsApi";
import { toAppError } from "@/lib/utils/error";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const { id } = await context.params;
        const data = await leadService.getLeadTimeline(session.instituteId, id);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}


