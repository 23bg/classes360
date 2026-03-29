import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { createRouteLogger } from "@/lib/api/route-logger";
import { toAppError } from "@/lib/utils/error";
import { whatsappIntegrationService } from "@/features/whatsapp/whatsappApi";

export async function GET(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/institute/whatsapp#GET", req);

    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const data = await whatsappIntegrationService.getIntegrationSettings(session.instituteId);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        routeLog.error("institute_whatsapp_get_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function POST(req: NextRequest) {
    const routeLog = createRouteLogger("/api/v1/institute/whatsapp#POST", req);

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

        const body = (await req.json().catch(() => ({}))) as {
            action?: "connect" | "verify" | "activate";
            phoneNumber?: string;
            otp?: string;
            phoneNumberId?: string;
            businessAccountId?: string;
        };

        if (body.action === "connect") {
            const data = await whatsappIntegrationService.initiateConnection(session.instituteId, body.phoneNumber ?? "");
            return NextResponse.json({ success: true, data });
        }

        if (body.action === "verify") {
            const data = await whatsappIntegrationService.verifyOtp(session.instituteId, body.otp ?? "");
            return NextResponse.json({ success: true, data });
        }

        if (body.action === "activate") {
            const data = await whatsappIntegrationService.activateNumber(session.instituteId, {
                phoneNumberId: body.phoneNumberId ?? "",
                businessAccountId: body.businessAccountId ?? "",
            });
            return NextResponse.json({ success: true, data });
        }

        return NextResponse.json(
            { success: false, error: { code: "INVALID_ACTION", message: "Invalid action" } },
            { status: 400 }
        );
    } catch (error) {
        routeLog.error("institute_whatsapp_post_failed", error);
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

