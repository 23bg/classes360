import { NextRequest, NextResponse } from "next/server";
import { instituteService } from "@/features/institute/instituteApi";
import { toAppError } from "@/lib/utils/error";
import { createRouteLogger } from "@/lib/api/route-logger";

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function GET(_req: NextRequest, context: RouteContext) {
    const routeLog = createRouteLogger("/api/v1/public/[slug]#GET", _req);
    try {
        const { slug } = await context.params;
        routeLog.info("public_institute_get_started", { slug });
        const data = await instituteService.getPublicPage(slug);
        routeLog.info("public_institute_get_succeeded", { slug, instituteId: data.id });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("public_institute_get_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

