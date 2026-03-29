import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, readSessionFromCookie, setSessionCookie } from "@/lib/auth/auth";
import { canManageBilling } from "@/lib/auth/permissions";
import { subscriptionService } from "@/features/subscription/subscriptionApi";
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

        if (!canManageBilling(session.role)) {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Only owner can manage billing" } },
                { status: 403 }
            );
        }

        const body = (await req.json().catch(() => ({}))) as {
            razorpay_payment_id?: string;
            razorpay_subscription_id?: string;
            razorpay_signature?: string;
        };

        if (!body.razorpay_payment_id || !body.razorpay_subscription_id || !body.razorpay_signature) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: "INVALID_CONFIRM_PAYLOAD", message: "Missing Razorpay confirmation fields" },
                },
                { status: 400 }
            );
        }

        const data = await subscriptionService.confirmRazorpaySubscription({
            instituteId: session.instituteId,
            paymentId: body.razorpay_payment_id,
            subscriptionId: body.razorpay_subscription_id,
            signature: body.razorpay_signature,
        });

        const nextToken = createSessionToken({
            ...session,
            subscriptionStatus: data.status,
        });
        await setSessionCookie(nextToken);

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

