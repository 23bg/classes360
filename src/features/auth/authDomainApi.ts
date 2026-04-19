import bcrypt from "bcryptjs";
import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";
import { logger } from "@/lib/utils/logger";
import { enforceRateLimit } from "@/lib/utils/rateLimit";
import { otpRepository } from "@/features/auth/otpDataApi";
import { userRepository } from "@/features/auth/userDataApi";
import { mailerService } from "@/lib/mailerApi";
import { issueSession } from "@/features/auth/services/issueSession";
import { OtpPurpose } from "@/features/auth/constants/otpPurpose";
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
    name: string;
    phoneNumber: string;
    email: string;
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
    redirectTo?: string;
    status?: "PENDING_VERIFICATION" | "VERIFIED_NO_PASSWORD" | "ACTIVE";
    message?: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const generateOtpCode = (): string => crypto.randomInt(0, 100_000).toString().padStart(5, "0");

const resolvePostLoginRedirect = (input: {
    isOnboarded: boolean;
    subscriptionStatus: "TRIAL" | "ACTIVE" | "PAST_DUE" | "INACTIVE" | "CANCELLED";
}): "/overview" | "/pricing" | "/onboarding" => {
    if (!input.isOnboarded) {
        return "/onboarding";
    }

    return input.subscriptionStatus === "ACTIVE" || input.subscriptionStatus === "TRIAL"
        ? "/overview"
        : "/pricing";
};

const isPrismaStatusFieldError = (error: unknown): boolean => {
    const message = error instanceof Error ? error.message : String(error);
    return /Unknown arg.*status|Field 'status' doesn't exist|Field `status`.*unknown/i.test(message);
};

const safeCreateUser = async (input: Parameters<typeof userRepository.create>[0]) => {
    try {
        return await userRepository.create(input);
    } catch (error) {
        if (input.status !== undefined && isPrismaStatusFieldError(error)) {
            const { status, ...rest } = input;
            return await userRepository.create(rest as Parameters<typeof userRepository.create>[0]);
        }
        throw error;
    }
};

const safeUpdateUser = async (
    email: string,
    input: Parameters<typeof userRepository.updateByEmail>[1]
) => {
    try {
        return await userRepository.updateByEmail(email, input);
    } catch (error) {
        if (input.status !== undefined && isPrismaStatusFieldError(error)) {
            const { status, ...rest } = input;
            return await userRepository.updateByEmail(email, rest as Parameters<typeof userRepository.updateByEmail>[1]);
        }
        throw error;
    }
};

const sendOtpForPurpose = async (input: RequestOtpInput): Promise<{ expiresAt: number }> => {
    const email = normalizeEmail(input.email);
    if (!email.includes("@")) {
        throw new AppError("Invalid email", 400, "INVALID_EMAIL");
    }

    const rate = await enforceRateLimit(`otp:${input.purpose}:${input.ip}:${email}`, env.OTP_RATE_LIMIT_PER_MIN, 60_000);
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

    // Send email asynchronously (fire-and-forget) so SMTP latency doesn't block the request.
    mailerService
        .sendOtpEmail({ email, otp, purpose: input.purpose })
        .catch((err) => logger.error({ error: err, email, purpose: input.purpose }, "otp_email_send_failed"));

    return { expiresAt: expiresAt.getTime() };
};

export const authService = {
    async signup(input: SignupInput): Promise<{ requiresEmailVerification: true; expiresAt: number }> {
        const email = normalizeEmail(input.email);
        const name = input.name.trim();
        const phoneNumber = input.phoneNumber.trim();

        if (!email.includes("@")) {
            throw new AppError("Invalid email", 400, "INVALID_EMAIL");
        }

        if (!name) {
            throw new AppError("Name is required", 400, "NAME_REQUIRED");
        }

        if (!phoneNumber) {
            throw new AppError("Phone number is required", 400, "PHONE_REQUIRED");
        }

        const existing = await userRepository.findByEmail(email);
        if (existing && existing.status === "ACTIVE") {
            throw new AppError("Email already registered", 409, "EMAIL_ALREADY_REGISTERED");
        }

        if (!existing) {
            await safeCreateUser({
                email,
                name,
                phoneNumber,
                emailVerified: false,
                status: "PENDING_VERIFICATION",
                otpPending: false,
                otpResendCount: 0,
                otpAttempts: 0,
                otpExpiresAt: null,
            });
        } else {
            await safeUpdateUser(email, {
                name,
                phoneNumber,
                emailVerified: false,
                status: "PENDING_VERIFICATION",
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

    async verifyOtp(input: VerifyOtpInput): Promise<{ verified: true; status?: "PENDING_VERIFICATION" | "VERIFIED_NO_PASSWORD" | "ACTIVE" }> {
        const email = normalizeEmail(input.email);
        const valid = await otpRepository.verifyOtp(email, input.otp, input.purpose);

        if (!valid) {
            throw new AppError("Invalid or expired OTP", 401, "INVALID_OTP");
        }

        await otpRepository.consumeOtp(email, {
            markEmailVerified: input.purpose === OtpPurpose.VERIFY_EMAIL,
        });

        if (input.purpose === OtpPurpose.VERIFY_EMAIL) {
            const user = await userRepository.findByEmail(email);
            if (!user) {
                throw new AppError("Account not found", 404, "USER_NOT_FOUND");
            }

            const nextStatus = user.passwordHash ? "ACTIVE" : "VERIFIED_NO_PASSWORD";
            await safeUpdateUser(email, {
                status: nextStatus,
            });

            return { verified: true, status: nextStatus };
        }

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

        if (!user) {
            throw new AppError("User not found", 404, "USER_NOT_FOUND");
        }

        const status = user.status ?? (user.emailVerified ? (user.passwordHash ? "ACTIVE" : "VERIFIED_NO_PASSWORD") : "PENDING_VERIFICATION");

        if (status === "PENDING_VERIFICATION") {
            return {
                mfaRequired: false,
                redirectTo: "/verification",
                status,
                message: "Please verify your email before logging in.",
            };
        }

        if (status === "VERIFIED_NO_PASSWORD") {
            return {
                mfaRequired: false,
                redirectTo: "/forgot-password?mode=setup&email=" + encodeURIComponent(email),
                status,
                message: "You haven’t set your password yet. Please create one.",
            };
        }

        if (status !== "ACTIVE") {
            throw new AppError("Account cannot sign in", 403, "ACCOUNT_INACTIVE");
        }

        if (!user.passwordHash) {
            throw new AppError("Password is not set for this account", 403, "PASSWORD_NOT_SET");
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
        }

        if (Boolean(user.mfaEnabled)) {
            await sendOtpForPurpose({
                email,
                ip: input.ip,
                purpose: OtpPurpose.MFA,
            });

            return { mfaRequired: true };
        }

        const issued = await issueSession({ userId: user.id });
        if (!issued) {
            throw new AppError("Unable to create session", 500, "SESSION_ISSUE_FAILED");
        }

        return {
            mfaRequired: false,
            redirectTo: resolvePostLoginRedirect({
                isOnboarded: issued.access.isOnboarded,
                subscriptionStatus: issued.access.subscriptionStatus,
            }),
            status,
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

        const issued = await issueSession({ userId: user.id });
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
        if (!user) {
            throw new AppError("Account not found", 404, "USER_NOT_FOUND");
        }

        const valid = await otpRepository.verifyOtp(email, input.otp, OtpPurpose.RESET_PASSWORD);
        if (!valid) {
            throw new AppError("Invalid or expired OTP", 401, "INVALID_OTP");
        }

        const newPasswordHash = await bcrypt.hash(input.newPassword, 12);
        await safeUpdateUser(email, {
            passwordHash: newPasswordHash,
            emailVerified: true,
            status: "ACTIVE",
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


