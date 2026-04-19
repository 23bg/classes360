import { NextRequest, NextResponse } from "next/server";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { billingService } from "@/features/billing/services/billing.service";
import { toAppError } from "@/lib/utils/error";
import { isPlanType } from "@/config/plans";
import type { BillingInterval } from "@/features/subscription/subscriptionApi";

export async function POST(req: NextRequest) {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const body = (await req.json().catch(() => ({}))) as {
            code?: string;
            planType?: string;
            interval?: string;
            currency?: string;
        };

        if (!body.code) {
            return NextResponse.json(
                { success: false, error: { code: "COUPON_CODE_REQUIRED", message: "Coupon code is required." } },
                { status: 400 }
            );
        }

        if (!body.planType || !isPlanType(body.planType)) {
            return NextResponse.json(
                { success: false, error: { code: "INVALID_PLAN", message: "Unsupported plan type." } },
                { status: 400 }
            );
        }

        const interval = body.interval === "YEARLY" || body.interval === "MONTHLY" ? body.interval : "MONTHLY";
        const currency = body.currency === "USD" ? "USD" : "INR";

        const result = await billingService.applyCoupon({
            instituteId: session.instituteId,
            userId: session.userId,
            code: body.code,
            plan: body.planType as "STARTER" | "TEAM" | "GROWTH" | "SCALE",
            billingCycle: interval as BillingInterval,
            currency,
        });

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}
