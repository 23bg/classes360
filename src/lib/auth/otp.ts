import crypto from "crypto";
import { env, requireEnv } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";

type OtpRecord = {
    otpHash: string;
    expiresAt: number;
    resendCount: number;
};

const otpStore = new Map<string, OtpRecord>();

const toOtpKey = (email: string) => email.trim().toLowerCase();

const hashOtp = (otp: string) =>
    crypto
        .createHash("sha256")
        .update(`${otp}:${requireEnv("JWT_SECRET")}`)
        .digest("hex");

export const generateOtp = (): string => {
    const value = crypto.randomInt(0, 1_000_000);
    return value.toString().padStart(6, "0");
};

export const issueOtp = (email: string): { otp: string; expiresAt: number } => {
    const key = toOtpKey(email);
    const existing = otpStore.get(key);

    if (existing && existing.resendCount >= env.OTP_MAX_RESEND) {
        throw new AppError("Maximum OTP resend attempts reached", 429, "OTP_RESEND_LIMIT");
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + env.OTP_EXPIRY_MINUTES * 60_000;

    otpStore.set(key, {
        otpHash: hashOtp(otp),
        expiresAt,
        resendCount: (existing?.resendCount ?? 0) + 1,
    });

    return { otp, expiresAt };
};

export const verifyOtp = (email: string, otp: string): boolean => {
    const key = toOtpKey(email);
    const record = otpStore.get(key);

    if (!record) return false;
    if (Date.now() > record.expiresAt) {
        otpStore.delete(key);
        return false;
    }

    const ok = record.otpHash === hashOtp(otp);
    if (ok) otpStore.delete(key);
    return ok;
};

