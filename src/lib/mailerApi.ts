import nodemailer from "nodemailer";
import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";
import { logger } from "@/lib/utils/logger";
import { OtpPurpose } from "@/modules/auth/domain/otpPurpose";

let transporter: nodemailer.Transporter | null = null;

const createTransporter = (secure: boolean): nodemailer.Transporter =>
    nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure,
        auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
        },
    });

const shouldRetryWithFlippedSecure = (error: unknown): boolean => {
    if (!error || typeof error !== "object") return false;
    const code = (error as { code?: unknown }).code;
    const reason = (error as { reason?: unknown }).reason;
    return code === "ESOCKET" && typeof reason === "string" && reason.toLowerCase().includes("wrong version number");
};

const resolveSecureDefault = (): boolean => {
    if (env.SMTP_PORT === 465) return true;
    return env.SMTP_SECURE;
};

const getTransporter = (): nodemailer.Transporter => {
    if (transporter) {
        return transporter;
    }

    if (!env.SMTP_HOST || !env.SMTP_PORT || !env.SMTP_USER || !env.SMTP_PASS || !env.SMTP_FROM) {
        throw new AppError(
            "SMTP is not fully configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
            500,
            "SMTP_CONFIG_MISSING"
        );
    }

    transporter = createTransporter(resolveSecureDefault());

    return transporter;
};

const purposeLabel: Record<OtpPurpose, string> = {
    [OtpPurpose.VERIFY_EMAIL]: "verify your email",
    [OtpPurpose.MFA]: "complete sign in",
    [OtpPurpose.RESET_PASSWORD]: "reset your password",
};

const renderOtpEmailHtml = (otp: string, expiryMinutes: number, purpose: OtpPurpose): string => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
    <h2 style="margin:0 0 12px;">Your Classes360 OTP</h2>
        <p style="margin:0 0 16px;color:#4b5563;">Use the OTP below to ${purposeLabel[purpose]}.</p>
    <div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:16px 0;color:#111827;">${otp}</div>
    <p style="margin:0;color:#6b7280;">This OTP expires in ${expiryMinutes} minutes.</p>
  </div>
`;

export const mailerService = {
    async sendOtpEmail(input: { email: string; otp: string; purpose?: OtpPurpose }): Promise<void> {
        if (!env.OTP_EMAIL_ENABLED) {
            logger.info({ email: input.email }, "OTP email sending disabled; skipping provider send");
            return;
        }

        const purpose = input.purpose ?? OtpPurpose.VERIFY_EMAIL;

        let transport = getTransporter();

        const message = {
            from: `"${env.SMTP_HOST_NAME}" <${env.SMTP_FROM}>`,
            // from: env.SMTP_FROM,
            to: input.email,
            subject: "Your Classes360 OTP",
            text: `Your OTP is ${input.otp}. Use it to ${purposeLabel[purpose]}. It expires in ${env.OTP_EXPIRY_MINUTES} minutes.`,
            html: renderOtpEmailHtml(input.otp, env.OTP_EXPIRY_MINUTES, purpose),
        };

        try {
            await transport.sendMail(message);
        } catch (error) {
            if (shouldRetryWithFlippedSecure(error)) {
                const fallbackSecure = !resolveSecureDefault();
                logger.warn({ email: input.email, fallbackSecure }, "Retrying OTP email with flipped SMTP secure mode");
                try {
                    transport = createTransporter(fallbackSecure);
                    await transport.sendMail(message);
                    transporter = transport;
                    return;
                } catch (retryError) {
                    if (process.env.NODE_ENV !== "production") {
                        logger.warn(
                            { email: input.email, error: retryError },
                            "OTP email provider failed in non-production; continuing with debug OTP flow"
                        );
                        return;
                    }
                    logger.error({ error: retryError, email: input.email }, "Failed to send OTP email after retry");
                    throw new AppError("Unable to send OTP email. Please try again.", 500, "OTP_EMAIL_SEND_FAILED");
                }
            }

            if (process.env.NODE_ENV !== "production") {
                logger.warn({ error, email: input.email }, "OTP email provider failed in non-production; continuing with debug OTP flow");
                return;
            }

            logger.error({ error, email: input.email }, "Failed to send OTP email");
            throw new AppError("Unable to send OTP email. Please try again.", 500, "OTP_EMAIL_SEND_FAILED");
        }
    },

    async sendNotificationEmail(input: {
        to: string;
        subject: string;
        text: string;
        html?: string;
    }): Promise<void> {
        let transport = getTransporter();

        const message = {
            from: `"${env.SMTP_HOST_NAME}" <${env.SMTP_FROM}>`,
            to: input.to,
            subject: input.subject,
            text: input.text,
            html: input.html,
        };

        try {
            await transport.sendMail(message);
        } catch (error) {
            if (shouldRetryWithFlippedSecure(error)) {
                const fallbackSecure = !resolveSecureDefault();
                transport = createTransporter(fallbackSecure);
                await transport.sendMail(message);
                transporter = transport;
                return;
            }

            logger.error({ error, to: input.to, subject: input.subject }, "Failed to send notification email");
            throw new AppError("Unable to send notification email.", 500, "NOTIFICATION_EMAIL_SEND_FAILED");
        }
    },
};
