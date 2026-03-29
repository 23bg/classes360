import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { noteService } from "@/features/notes/notesApi";
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

        const page = Number(req.nextUrl.searchParams.get("page") ?? "1");
        const pageSize = Number(req.nextUrl.searchParams.get("pageSize") ?? "20");
        const courseId = req.nextUrl.searchParams.get("courseId") ?? undefined;
        const batchId = req.nextUrl.searchParams.get("batchId") ?? undefined;

        const data = await noteService.listNotes(session.instituteId, { page, pageSize, courseId, batchId });
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function POST(req: NextRequest) {
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

        const body = (await req.json()) as {
            title: string;
            description?: string;
            fileUrl?: string;
            courseId?: string;
            batchId?: string;
        };

        const data = await noteService.createNote({
            instituteId: session.instituteId,
            createdBy: session.userId,
            ...body,
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

