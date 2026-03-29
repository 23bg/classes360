import crypto from "crypto";
import Razorpay from "razorpay";
import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";

const hasRazorpayConfig = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

export const razorpay =
    hasRazorpayConfig
        ? new Razorpay({
            key_id: env.RAZORPAY_KEY_ID as string,
            key_secret: env.RAZORPAY_KEY_SECRET as string,
        })
        : null;

export const assertRazorpayReady = (): void => {
    if (!razorpay) {
        throw new AppError("Razorpay is not configured", 500, "RAZORPAY_NOT_CONFIGURED");
    }
};

export const verifyRazorpayWebhookSignature = (payload: string, signature: string): boolean => {
    if (!env.RAZORPAY_WEBHOOK_SECRET) {
        throw new AppError("Missing RAZORPAY_WEBHOOK_SECRET", 500, "RAZORPAY_WEBHOOK_SECRET_MISSING");
    }

    const expected = crypto
        .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
        .update(payload)
        .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};

export const verifyRazorpayCheckoutSignature = (input: {
    paymentId: string;
    subscriptionId: string;
    signature: string;
}): boolean => {
    if (!env.RAZORPAY_KEY_SECRET) {
        throw new AppError("Missing RAZORPAY_KEY_SECRET", 500, "RAZORPAY_SECRET_MISSING");
    }

    const payload = `${input.paymentId}|${input.subscriptionId}`;
    const expected = crypto
        .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(input.signature));
};

