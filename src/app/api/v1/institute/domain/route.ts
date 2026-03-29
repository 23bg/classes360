import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { instituteService } from "@/features/institute/instituteApi";
import { toAppError } from "@/lib/utils/error";
import { createRouteLogger } from "@/lib/api/route-logger";

export async function GET(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/institute/domain#GET", req);
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            routeLog.warn("institute_domain_get_unauthorized");
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const data = await instituteService.getDomainSettings(session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("institute_domain_get_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function PUT(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/institute/domain#PUT", req);
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            routeLog.warn("institute_domain_put_unauthorized");
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!canWriteInstituteData(session.role)) {
            routeLog.warn("institute_domain_put_forbidden", { userId: session.userId, instituteId: session.instituteId, role: session.role });
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        const body = (await req.json()) as {
            customDomain?: string;
            surface?: string;
        };

        const data = await instituteService.saveCustomDomain(
            session.instituteId,
            body.customDomain ?? "",
            body.surface ?? "portal"
        );

        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("institute_domain_put_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/institute/domain#POST", req);
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            routeLog.warn("institute_domain_post_unauthorized");
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!canWriteInstituteData(session.role)) {
            routeLog.warn("institute_domain_post_forbidden", { userId: session.userId, instituteId: session.instituteId, role: session.role });
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        const body = (await req.json()) as {
            customDomain?: string;
            action?: "verify" | "activate";
        };

        if (body.action === "activate") {
            const data = await instituteService.activateCustomDomain(session.instituteId, body.customDomain);
            return NextResponse.json({ success: true, data });
        }

        const data = await instituteService.verifyCustomDomain(session.instituteId, body.customDomain);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("institute_domain_post_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

