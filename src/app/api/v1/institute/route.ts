import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { instituteService } from "@/features/institute/instituteApi";
import { toAppError } from "@/lib/utils/error";
import { createRouteLogger } from "@/lib/api/route-logger";

export async function GET() {
    const routeLog = createRouteLogger("/api/v1/institute#GET");
    try {
        const session = await readSessionFromCookie();
        if (!session) {
            routeLog.warn("institute_get_unauthorized");
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        routeLog.info("institute_get_started", { userId: session.userId, instituteId: session.instituteId });
        const data = await instituteService.getInstitute(session.userId);
        routeLog.info("institute_get_succeeded", { userId: session.userId, instituteId: session.instituteId });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("institute_get_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function PUT(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/institute#PUT", req);
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            routeLog.warn("institute_put_unauthorized");
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        if (!canWriteInstituteData(session.role)) {
            routeLog.warn("institute_put_forbidden", { userId: session.userId, instituteId: session.instituteId, role: session.role });
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Insufficient permissions" } },
                { status: 403 }
            );
        }

        routeLog.info("institute_put_started", { userId: session.userId, instituteId: session.instituteId });

        const body = (await req.json()) as {
            name?: string;
            slug?: string;
            description?: string;
            phone?: string;
            whatsapp?: string;
            address?: {
                addressLine1?: string;
                addressLine2?: string;
                city?: string;
                state?: string;
                region?: string;
                postalCode?: string;
                country?: string;
                countryCode?: string;
            } | string;
            addressLine1?: string;
            addressLine2?: string;
            city?: string;
            state?: string;
            region?: string;
            postalCode?: string;
            country?: string;
            countryCode?: string;
            timings?: string;
            logo?: string;
            banner?: string;
            heroImage?: string;
            googleMapLink?: string;
            socialLinks?: {
                website?: string;
                instagram?: string;
                facebook?: string;
                youtube?: string;
                linkedin?: string;
            };
            websiteUrl?: string;
            instagramUrl?: string;
            facebookUrl?: string;
            youtubeUrl?: string;
            linkedinUrl?: string;
        };

        const data = await instituteService.updateProfile(session.instituteId, body);
        routeLog.info("institute_put_succeeded", { userId: session.userId, instituteId: session.instituteId });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("institute_put_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

