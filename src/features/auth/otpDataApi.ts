import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { requireEnv } from "@/lib/config/env";
import { userRepository } from "@/features/auth/userDataApi";
import { OtpPurpose } from "@/modules/auth/domain/otpPurpose";

const MAX_VERIFY_ATTEMPTS = 5;

const hashOtp = (otp: string, purpose: OtpPurpose) =>
    crypto
        .createHash("sha256")
        .update(`${purpose}:${otp}:${requireEnv("JWT_SECRET")}`)
        .digest("hex");

const purposeSubject = (purpose: OtpPurpose) => `OTP:${purpose}`;

export const otpRepository = {
    saveOtp: async (input: {
        email: string;
        otp: string;
        purpose: OtpPurpose;
        expiresAt: Date;
        resendCount: number;
    }) => {
        const normalizedEmail = input.email.trim().toLowerCase();
        const existingUser = await userRepository.findByEmail(normalizedEmail);

        if (!existingUser) {
            return false;
        }

        await userRepository.updateByEmail(normalizedEmail, {
            otpHash: hashOtp(input.otp, input.purpose),
            otpExpiresAt: input.expiresAt,
            otpResendCount: input.resendCount,
            otpAttempts: 0,
            otpPending: true,
            subject: purposeSubject(input.purpose),
        });

        return true;
    },

    getLatestByEmailAndPurpose: async (email: string, purpose: OtpPurpose) =>
        prisma.user.findUnique({
            where: { email: email.trim().toLowerCase() },
            select: {
                otpExpiresAt: true,
                otpResendCount: true,
                otpPending: true,
                subject: true,
            },
        }).then((record) => {
            if (!record) return null;
            if (record.subject !== purposeSubject(purpose)) {
                return null;
            }
            return record;
        }),

    verifyOtp: async (email: string, otp: string, purpose: OtpPurpose) => {
        const normalizedEmail = email.trim().toLowerCase();
        const record = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
                otpHash: true,
                otpExpiresAt: true,
                otpPending: true,
                otpAttempts: true,
                subject: true,
            },
        });

        if (!record) return false;
        if (record.subject !== purposeSubject(purpose)) return false;
        if (!record.otpPending || !record.otpHash || !record.otpExpiresAt) return false;
        if ((record.otpAttempts ?? 0) >= MAX_VERIFY_ATTEMPTS) return false;
        if (record.otpExpiresAt.getTime() < Date.now()) {
            await userRepository.updateByEmail(normalizedEmail, {
                otpPending: false,
                otpHash: null,
                otpExpiresAt: null,
                otpResendCount: 0,
                otpAttempts: 0,
                subject: null,
            });
            return false;
        }

        const isValid = record.otpHash === hashOtp(otp, purpose);
        if (!isValid) {
            const nextAttempts = (record.otpAttempts ?? 0) + 1;
            await userRepository.updateByEmail(normalizedEmail, {
                otpAttempts: nextAttempts,
                ...(nextAttempts >= MAX_VERIFY_ATTEMPTS
                    ? {
                        otpPending: false,
                        otpHash: null,
                        otpExpiresAt: null,
                        otpResendCount: 0,
                        subject: null,
                    }
                    : {}),
            });
            return false;
        }

        return true;
    },

    consumeOtp: async (email: string, input?: { markEmailVerified?: boolean }) =>
        userRepository.updateByEmail(email, {
            otpHash: null,
            otpExpiresAt: null,
            otpPending: false,
            otpResendCount: 0,
            otpAttempts: 0,
            subject: null,
            ...(input?.markEmailVerified ? { emailVerified: true } : {}),
        }),
};

