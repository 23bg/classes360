import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { canWriteInstituteData } from "@/lib/auth/permissions";
import { teamService } from "@/features/team/teamApi";
import { toAppError } from "@/lib/utils/error";

type RouteContext = {
    params: Promise<{ id: string }>;
};

const updateTeamMemberRoleSchema = z.object({
    role: z.enum(["MANAGER", "VIEWER"]),
}).strict();

export async function PATCH(req: NextRequest, context: RouteContext) {
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

        const { id } = await context.params;
        const body = updateTeamMemberRoleSchema.parse(await req.json());
        const data = await teamService.updateMemberRole(session.instituteId, session.role, session.userId, id, body.role);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
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

        const { id } = await context.params;
        const data = await teamService.removeMember(session.instituteId, session.role, session.userId, id);
        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

