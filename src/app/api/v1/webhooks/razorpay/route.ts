import { NextRequest, NextResponse } from "next/server";
import { subscriptionService } from "@/features/subscription/subscriptionApi";
import { billingService } from "@/features/billing/billingApi";
import { toAppError } from "@/lib/utils/error";
import { verifyRazorpayWebhookSignature } from "@/lib/billing/razorpay";

type RazorpayWebhookPayload = {
    event?: string;
    payload?: {
        subscription?: {
            entity?: {
                id?: string;
                notes?: {
                    instituteId?: string;
                };
                current_end?: number;
            };
        };
        payment?: {
            entity?: {
                id?: string;
                notes?: {
                    instituteId?: string;
                    invoiceId?: string;
                };
            };
        };
        payment_link?: {
            entity?: {
                id?: string;
                notes?: {
                    instituteId?: string;
                    invoiceId?: string;
                };
            };
        };
    };
};

export async function POST(req: NextRequest) {
    try {
        const signature = req.headers.get("x-razorpay-signature");
        if (!signature) {
            return NextResponse.json(
                { success: false, error: { code: "MISSING_SIGNATURE", message: "Missing webhook signature" } },
                { status: 400 }
            );
        }

        const rawPayload = await req.text();
        const isValid = verifyRazorpayWebhookSignature(rawPayload, signature);

        if (!isValid) {
            return NextResponse.json(
                { success: false, error: { code: "INVALID_SIGNATURE", message: "Invalid webhook signature" } },
                { status: 401 }
            );
        }

        const payload = JSON.parse(rawPayload) as RazorpayWebhookPayload;
        const event = payload.event ?? "";

        if (event === "payment_link.paid") {
            const paymentLinkId = payload.payload?.payment_link?.entity?.id;
            if (!paymentLinkId) {
                return NextResponse.json(
                    { success: false, error: { code: "PAYMENT_LINK_ID_MISSING", message: "Payment link id missing" } },
                    { status: 400 }
                );
            }

            await billingService.markInvoicePaidFromWebhook(paymentLinkId);

            return NextResponse.json({
                success: true,
                data: { event, paymentLinkId },
            });
        }

        const subscriptionEntity = payload.payload?.subscription?.entity;
        const paymentEntity = payload.payload?.payment?.entity;

        const instituteId =
            subscriptionEntity?.notes?.instituteId ??
            paymentEntity?.notes?.instituteId;

        const razorpaySubId = subscriptionEntity?.id;
        const currentPeriodEnd = subscriptionEntity?.current_end
            ? new Date(subscriptionEntity.current_end * 1000)
            : null;

        await subscriptionService.handleWebhookEvent({
            event,
            instituteId,
            razorpaySubId,
            currentPeriodEnd,
        });

        return NextResponse.json({
            success: true,
            data: { event, instituteId: instituteId ?? null, razorpaySubId: razorpaySubId ?? null },
        });
    } catch (error) {
        const appError = toAppError(error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: appError.code,
                    message: appError.message,
                },
            },
            { status: appError.statusCode }
        );
    }
}


