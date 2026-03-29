import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { studentService } from "@/server/studentsApi";
import { toAppError } from "@/lib/utils/error";

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

        const contentType = req.headers.get("content-type") ?? "";
        let csvText = "";

        if (contentType.includes("application/json")) {
            const body = (await req.json()) as { csv?: string };
            csvText = body.csv ?? "";
        } else {
            const formData = await req.formData();
            const file = formData.get("file");
            if (!file || !(file instanceof File)) {
                return NextResponse.json(
                    { success: false, error: { code: "FILE_REQUIRED", message: "CSV file is required" } },
                    { status: 400 }
                );
            }
            csvText = await file.text();
        }

        const data = await studentService.uploadCsv(session.instituteId, csvText);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

