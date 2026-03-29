import { z } from "zod";

export const signupValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export const loginValidation = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const requestOtpValidation = z.object({
    email: z.string().email(),
    purpose: z.enum(["VERIFY_EMAIL", "MFA", "RESET_PASSWORD"]),
});

export const verifyOtpValidation = z.object({
    email: z.string().email(),
    otp: z.string().regex(/^\d{5}$/),
    purpose: z.enum(["VERIFY_EMAIL", "MFA", "RESET_PASSWORD"]),
});
