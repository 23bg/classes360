import bcrypt from "bcryptjs";
import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";
import { logger } from "@/lib/utils/logger";
import { enforceRateLimit } from "@/lib/utils/rateLimit";
import { otpRepository } from "@/features/auth/otpDataApi";
import { userRepository } from "@/features/auth/userDataApi";
import { mailerService } from "@/lib/mailerApi";
import { issueSessionUseCase } from "@/modules/auth/application/issueSession.useCase";
import { OtpPurpose } from "@/modules/auth/domain/otpPurpose";
import crypto from "crypto";

export type RequestOtpInput = {
    email: string;
    ip: string;
    purpose: OtpPurpose;
};

export type VerifyOtpInput = {
    email: string;
    otp: string;
    purpose: OtpPurpose;
};

export type SignupInput = {
    email: string;
    password: string;
    ip: string;
};

export type LoginInput = {
    email: string;
    password: string;
    ip: string;
};

export type ResetPasswordInput = {
    email: string;
    otp: string;
    newPassword: string;
};

export type PasswordLoginResult = {
    mfaRequired: boolean;
    redirectTo?: "/overview" | "/pricing" | "/onboarding";
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const generateOtpCode = (): string => crypto.randomInt(0, 100_000).toString().padStart(5, "0");

const resolvePostLoginRedirect = (input: {
    isOnboarded: boolean;
    subscriptionStatus: "TRIAL" | "ACTIVE" | "INACTIVE" | "CANCELLED";
}): "/overview" | "/pricing" | "/onboarding" => {
    if (!input.isOnboarded) {
        return "/onboarding";
    }

    return input.subscriptionStatus === "ACTIVE" || input.subscriptionStatus === "TRIAL"
        ? "/overview"
        : "/pricing";
};

const sendOtpForPurpose = async (input: RequestOtpInput): Promise<{ expiresAt: number }> => {
    const email = normalizeEmail(input.email);
    if (!email.includes("@")) {
        throw new AppError("Invalid email", 400, "INVALID_EMAIL");
    }

    const rate = enforceRateLimit(`otp:${input.purpose}:${input.ip}:${email}`, env.OTP_RATE_LIMIT_PER_MIN, 60_000);
    if (!rate.ok) {
        throw new AppError(`Too many OTP requests. Retry in ${rate.retryAfter}s`, 429, "RATE_LIMITED");
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
        throw new AppError("Account not found", 404, "USER_NOT_FOUND");
    }

    if (input.purpose === OtpPurpose.VERIFY_EMAIL && user.emailVerified) {
        throw new AppError("Email already verified", 409, "EMAIL_ALREADY_VERIFIED");
    }

    const latest = await otpRepository.getLatestByEmailAndPurpose(email, input.purpose);
    const hasActiveOtp = Boolean(latest?.otpPending && latest.otpExpiresAt && latest.otpExpiresAt.getTime() > Date.now());

    if (hasActiveOtp && (latest?.otpResendCount ?? 0) >= env.OTP_MAX_RESEND) {
        throw new AppError("Maximum OTP resend attempts reached", 429, "OTP_RESEND_LIMIT");
    }

    const nextResendCount = hasActiveOtp ? (latest?.otpResendCount ?? 0) + 1 : 1;
    const otp = generateOtpCode();
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);
    const saved = await otpRepository.saveOtp({
        email,
        otp,
        purpose: input.purpose,
        expiresAt,
        resendCount: nextResendCount,
    });

    if (!saved) {
        throw new AppError("Account not found", 404, "USER_NOT_FOUND");
    }

    logger.info({ email, purpose: input.purpose, expiresAt }, "OTP issued");
    if (process.env.NODE_ENV !== "production") {
        logger.debug({ email, purpose: input.purpose, otp }, "OTP debug log for non-production environments");
    }

    await mailerService.sendOtpEmail({ email, otp, purpose: input.purpose });

    return { expiresAt: expiresAt.getTime() };
};

export const authService = {
    async signup(input: SignupInput): Promise<{ requiresEmailVerification: true; expiresAt: number }> {
        const email = normalizeEmail(input.email);
        const password = String(input.password ?? "");

        if (!email.includes("@")) {
            throw new AppError("Invalid email", 400, "INVALID_EMAIL");
        }

        if (password.length < 8) {
            throw new AppError("Password must be at least 8 characters", 400, "PASSWORD_TOO_SHORT");
        }

        const existing = await userRepository.findByEmail(email);
        if (existing?.passwordHash) {
            throw new AppError("Email already registered", 409, "EMAIL_ALREADY_REGISTERED");
        }

        const passwordHash = await bcrypt.hash(password, 12);
        if (!existing) {
            await userRepository.create({
                email,
                passwordHash,
                emailVerified: false,
                otpPending: false,
                otpResendCount: 0,
                otpAttempts: 0,
            });
        } else {
            await userRepository.updateByEmail(email, {
                passwordHash,
                emailVerified: false,
            });
        }

        const otpResult = await sendOtpForPurpose({
            email,
            ip: input.ip,
            purpose: OtpPurpose.VERIFY_EMAIL,
        });

        return {
            requiresEmailVerification: true,
            expiresAt: otpResult.expiresAt,
        };
    },

    async requestOtp(input: RequestOtpInput): Promise<{ expiresAt: number }> {
        return sendOtpForPurpose(input);
    },

    async verifyOtp(input: VerifyOtpInput): Promise<{ verified: true }> {
        const email = normalizeEmail(input.email);
        const valid = await otpRepository.verifyOtp(email, input.otp, input.purpose);

        if (!valid) {
            throw new AppError("Invalid or expired OTP", 401, "INVALID_OTP");
        }

        await otpRepository.consumeOtp(email, {
            markEmailVerified: input.purpose === OtpPurpose.VERIFY_EMAIL,
        });

        return { verified: true };
    },

    async login(input: LoginInput): Promise<PasswordLoginResult> {
        const email = normalizeEmail(input.email);
        const password = String(input.password ?? "");

        if (!email || !password) {
            throw new AppError("Email and password are required", 400, "MISSING_CREDENTIALS");
        }

        const user = (await userRepository.findByEmail(email)) as (Awaited<ReturnType<typeof userRepository.findByEmail>> & {
            mfaEnabled?: boolean;
        }) | null;

        if (!user || !user.passwordHash) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }

        if (!user.emailVerified) {
            throw new AppError("Please verify your email before logging in", 403, "EMAIL_NOT_VERIFIED");
        }

        if (Boolean(user.mfaEnabled)) {
            await sendOtpForPurpose({
                email,
                ip: input.ip,
                purpose: OtpPurpose.MFA,
            });

            return { mfaRequired: true };
        }

        const issued = await issueSessionUseCase({ userId: user.id });
        if (!issued) {
            throw new AppError("Unable to create session", 500, "SESSION_ISSUE_FAILED");
        }

        return {
            mfaRequired: false,
            redirectTo: resolvePostLoginRedirect({
                isOnboarded: issued.access.isOnboarded,
                subscriptionStatus: issued.access.subscriptionStatus,
            }),
        };
    },

    async completeMfaLogin(input: VerifyOtpInput): Promise<{ redirectTo: "/overview" | "/pricing" | "/onboarding" }> {
        if (input.purpose !== OtpPurpose.MFA) {
            throw new AppError("Invalid OTP purpose", 400, "INVALID_OTP_PURPOSE");
        }

        const email = normalizeEmail(input.email);
        const user = await userRepository.findByEmail(email);

        if (!user) {
            throw new AppError("Account not found", 404, "USER_NOT_FOUND");
        }

        const valid = await otpRepository.verifyOtp(email, input.otp, OtpPurpose.MFA);
        if (!valid) {
            throw new AppError("Invalid or expired OTP", 401, "INVALID_OTP");
        }

        await otpRepository.consumeOtp(email);

        const issued = await issueSessionUseCase({ userId: user.id });
        if (!issued) {
            throw new AppError("Unable to create session", 500, "SESSION_ISSUE_FAILED");
        }

        return {
            redirectTo: resolvePostLoginRedirect({
                isOnboarded: issued.access.isOnboarded,
                subscriptionStatus: issued.access.subscriptionStatus,
            }),
        };
    },

    async requestPasswordReset(input: { email: string; ip: string }): Promise<{ expiresAt: number }> {
        return sendOtpForPurpose({
            email: input.email,
            ip: input.ip,
            purpose: OtpPurpose.RESET_PASSWORD,
        });
    },

    async resetPassword(input: ResetPasswordInput): Promise<{ reset: true }> {
        const email = normalizeEmail(input.email);

        if (String(input.newPassword ?? "").length < 8) {
            throw new AppError("Password must be at least 8 characters", 400, "PASSWORD_TOO_SHORT");
        }

        const user = await userRepository.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new AppError("Account not found", 404, "USER_NOT_FOUND");
        }

        const valid = await otpRepository.verifyOtp(email, input.otp, OtpPurpose.RESET_PASSWORD);
        if (!valid) {
            throw new AppError("Invalid or expired OTP", 401, "INVALID_OTP");
        }

        const newPasswordHash = await bcrypt.hash(input.newPassword, 12);
        await userRepository.updateByEmail(email, {
            passwordHash: newPasswordHash,
        });
        await otpRepository.consumeOtp(email);

        return { reset: true };
    },

    async ensureEmailVerificationOtp(input: { email: string; ip: string }): Promise<{ expiresAt: number }> {
        return sendOtpForPurpose({
            email: input.email,
            ip: input.ip,
            purpose: OtpPurpose.VERIFY_EMAIL,
        });
    },
};


