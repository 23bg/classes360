import { z } from "zod";
import { OTP_PURPOSE_VALUES } from "@/modules/auth/domain/otpPurpose";

const otpPurposeSchema = z.enum(OTP_PURPOSE_VALUES as [string, ...string[]]);

export const signupRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const loginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const requestOtpRequestSchema = z.object({
    email: z.string().email(),
    purpose: otpPurposeSchema,
});

export const verifyOtpRequestSchema = z.object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{5}$/),
    purpose: otpPurposeSchema,
});

export const resetPasswordRequestSchema = z.object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{5}$/),
    newPassword: z.string().min(8),
});
