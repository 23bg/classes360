import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { reminderProducerService } from "@/lib/notifications/reminder-producer.service";
import { toAppError } from "@/lib/utils/error";

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId || session.role !== "OWNER") {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Only owners can run reminder producers" } },
                { status: 403 }
            );
        }

        const body = (await req.json().catch(() => ({}))) as { type?: "FOLLOW_UP" | "FEE_DUE" | "TRIAL_ENDING" | "ALL" };
        const type = body.type ?? "ALL";

        const results: Record<string, number> = {};

        if (type === "FOLLOW_UP" || type === "ALL") {
            const result = await reminderProducerService.produceFollowUpReminders();
            results.followUp = result.produced;
        }

        if (type === "FEE_DUE" || type === "ALL") {
            const result = await reminderProducerService.produceFeeDueReminders();
            results.feeDue = result.produced;
        }

        if (type === "TRIAL_ENDING" || type === "ALL") {
            const result = await reminderProducerService.produceTrialEndingSoonReminders();
            results.trialEnding = result.produced;
        }

        return NextResponse.json({ success: true, data: results });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
