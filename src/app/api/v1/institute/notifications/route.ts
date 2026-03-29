import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { createRouteLogger } from "@/lib/api/route-logger";
import { toAppError } from "@/lib/utils/error";
import { whatsappIntegrationService } from "@/features/whatsapp/whatsappApi";

export async function GET(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/institute/notifications#GET", req);

    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const data = await whatsappIntegrationService.getNotificationPreferences(session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("institute_notifications_get_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function PUT(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/institute/notifications#PUT", req);

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

        const body = (await req.json().catch(() => ({}))) as Partial<{
            newEnquiryAlert: boolean;
            followUpReminder: boolean;
            leadAssigned: boolean;
            paymentReceived: boolean;
            admissionConfirmed: boolean;
        }>;

        const data = await whatsappIntegrationService.updateNotificationPreferences(session.instituteId, body);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("institute_notifications_put_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

