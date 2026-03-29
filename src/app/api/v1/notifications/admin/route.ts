import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { notificationStoreService } from "@/lib/notifications/notification-store.service";
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

        const limit = Number(req.nextUrl.searchParams.get("limit") ?? "50");
        const data = await notificationStoreService.listAdminNotifications(session.instituteId, Number.isFinite(limit) ? limit : 50);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const body = (await req.json()) as { id?: string; read?: boolean };
        if (!body.id || typeof body.read !== "boolean") {
            return NextResponse.json(
                { success: false, error: { code: "BAD_REQUEST", message: "id and read are required" } },
                { status: 400 }
            );
        }

        const data = await notificationStoreService.markAdminNotificationRead(session.instituteId, body.id, body.read);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
