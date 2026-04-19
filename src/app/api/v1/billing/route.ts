import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, readSessionFromCookie, setSessionCookie } from "@/lib/auth/auth";
import { canManageBilling } from "@/lib/auth/permissions";
import { BillingInterval } from "@/features/subscription/subscriptionApi";
import { billingService } from "@/features/billing/services/billing.service";
import { toAppError } from "@/lib/utils/error";
import { isPlanType } from "@/config/plans";

export async function GET() {
    try {
        const session = await readSessionFromCookie();
        if (!session?.instituteId) {
            return NextResponse.json(
                { success: false, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
                { status: 401 }
            );
        }

        const data = await billingService.getBillingDashboard(session.instituteId, session.email);

        if (
            session.subscriptionStatus &&
            data?.summary?.status &&
            session.subscriptionStatus !== data.summary.status
        ) {
            const nextToken = createSessionToken({
                ...session,
                subscriptionStatus: data.summary.status,
            });
            await setSessionCookie(nextToken);
        }

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

        if (!canManageBilling(session.role)) {
            return NextResponse.json(
                { success: false, error: { code: "FORBIDDEN", message: "Only owner can manage billing" } },
                { status: 403 }
            );
        }

        const body = (await req.json().catch(() => ({}))) as {
            action?: string;
            planType?: string;
            interval?: string;
            invoiceId?: string;
            provider?: "RAZORPAY" | "STRIPE";
            couponCode?: string;
        };
        const typedBody = body as { action?: string; planType?: string; interval?: string; invoiceId?: string; provider?: "RAZORPAY" | "STRIPE"; couponCode?: string };
        if (body.action === "generate-invoice") {
            const invoice = await billingService.createOrUpdateClosedMonthInvoice(session.instituteId);
            return NextResponse.json({ success: true, data: invoice });
        }

        if (body.action === "retry-invoice") {
            if (!typedBody.invoiceId) {
                return NextResponse.json(
                    { success: false, error: { code: "INVOICE_ID_REQUIRED", message: "invoiceId is required" } },
                    { status: 400 }
                );
            }

            const data = await billingService.createInvoicePaymentSession({
                instituteId: session.instituteId,
                userId: session.userId,
                email: session.email,
                invoiceId: typedBody.invoiceId,
                provider: typedBody.provider ?? null,
            });

            return NextResponse.json({
                success: true,
                data: {
                    ...data,
                    subscriptionId: data.providerSubscriptionId ?? null,
                    key: data.publishableKey ?? null,
                },
            });
        }

        if (body.action === "run-dunning") {
            const data = await billingService.runDunningCycle();
            return NextResponse.json({ success: true, data });
        }

        if (body.action !== "create-subscription") {
            return NextResponse.json(
                { success: false, error: { code: "INVALID_ACTION", message: "Unsupported action" } },
                { status: 400 }
            );
        }

        if (body.planType && !isPlanType(body.planType)) {
            return NextResponse.json(
                { success: false, error: { code: "INVALID_PLAN", message: "Unsupported plan type" } },
                { status: 400 }
            );
        }

        const interval: BillingInterval =
            body.interval && (body.interval === "YEARLY" || body.interval === "MONTHLY")
                ? body.interval
                : "MONTHLY";

        const created = await billingService.createCheckoutSession({
            instituteId: session.instituteId,
            userId: session.userId,
            email: session.email,
            planType: (body.planType ?? "STARTER") as "STARTER" | "TEAM" | "GROWTH" | "SCALE",
            interval,
            provider: typedBody.provider ?? null,
            couponCode: typedBody.couponCode ?? null,
        });
        return NextResponse.json({
            success: true,
            data: {
                ...created,
                subscriptionId: created.providerSubscriptionId ?? null,
                key: created.publishableKey ?? null,
            },
        });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            { success: false, error: { code: appError.code, message: appError.message } },
            { status: appError.statusCode }
        );
    }
}

