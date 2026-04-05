import { z } from "zod";
import { env } from "@/lib/config/env";
import { AppError } from "@/lib/utils/error";

const phoneSchema = z.string().trim().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number");
const otpSchema = z.string().trim().regex(/^\d{6}$/, "Invalid OTP");
const idSchema = z.string().trim().min(3).max(64);

export type SenderMode = "CLASSES360_SHARED" | "INSTITUTE_CUSTOM";

const DEMO_OTP = "123456";

const getWhatsAppAccountRepository = async () => {
    const module = await import("@/features/whatsapp/whatsappAccountApi");
    return module.whatsappAccountRepository;
};

const getNotificationPreferenceRepository = async () => {
    const module = await import("@/features/whatsapp/notificationPreferenceApi");
    return module.notificationPreferenceRepository;
};

export const whatsappIntegrationService = {
    async getSenderRouting(instituteId: string) {
        const whatsappAccountRepository = await getWhatsAppAccountRepository();
        const account = await whatsappAccountRepository.getByInstituteId(instituteId);

        if (account?.status === "ACTIVE" && account.phoneNumberId) {
            return {
                mode: "INSTITUTE_CUSTOM" as const,
                senderPhoneNumberId: account.phoneNumberId,
                account,
                fallbackPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID ?? null,
            };
        }

        return {
            mode: "CLASSES360_SHARED" as const,
            senderPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID ?? null,
            account,
            fallbackPhoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID ?? null,
        };
    },

    async getIntegrationSettings(instituteId: string) {
        const routing = await this.getSenderRouting(instituteId);

        return {
            mode: routing.mode,
            connectedNumber: routing.account?.phoneNumber ?? null,
            status: routing.account?.status ?? "DISCONNECTED",
            phoneNumberId: routing.account?.phoneNumberId ?? null,
            businessAccountId: routing.account?.businessAccountId ?? null,
            connectedAt: routing.account?.connectedAt ?? null,
        };
    },

    async initiateConnection(instituteId: string, phoneNumber: string) {
        const whatsappAccountRepository = await getWhatsAppAccountRepository();
        const normalizedPhone = phoneSchema.parse(phoneNumber);
        const account = await whatsappAccountRepository.upsertPending(instituteId, normalizedPhone);

        return {
            message: "OTP sent to WhatsApp number",
            status: account.status,
            otpHint: DEMO_OTP,
        };
    },

    async verifyOtp(instituteId: string, otp: string) {
        const whatsappAccountRepository = await getWhatsAppAccountRepository();
        const parsedOtp = otpSchema.parse(otp);
        const account = await whatsappAccountRepository.getByInstituteId(instituteId);
        if (!account) {
            throw new AppError("WhatsApp connection not initiated", 400, "WHATSAPP_CONNECT_NOT_INITIATED");
        }

        if (parsedOtp !== DEMO_OTP) {
            throw new AppError("Invalid OTP", 400, "WHATSAPP_OTP_INVALID");
        }

        await whatsappAccountRepository.markVerified(instituteId);

        return {
            verified: true,
            status: "VERIFIED",
        };
    },

    async activateNumber(instituteId: string, payload: { phoneNumberId: string; businessAccountId: string }) {
        const whatsappAccountRepository = await getWhatsAppAccountRepository();
        const phoneNumberId = idSchema.parse(payload.phoneNumberId);
        const businessAccountId = idSchema.parse(payload.businessAccountId);

        const account = await whatsappAccountRepository.getByInstituteId(instituteId);
        if (!account) {
            throw new AppError("WhatsApp connection not initiated", 400, "WHATSAPP_CONNECT_NOT_INITIATED");
        }

        if (account.status !== "VERIFIED" && account.status !== "ACTIVE") {
            throw new AppError("Verify OTP before activation", 400, "WHATSAPP_OTP_REQUIRED");
        }

        const activated = await whatsappAccountRepository.activate(instituteId, {
            phoneNumberId,
            businessAccountId,
        });

        return {
            status: activated.status,
            connectedAt: activated.connectedAt,
            phoneNumberId: activated.phoneNumberId,
            businessAccountId: activated.businessAccountId,
        };
    },

    async markSenderFailure(instituteId: string) {
        const whatsappAccountRepository = await getWhatsAppAccountRepository();
        await whatsappAccountRepository.markFailed(instituteId);
    },

    async getNotificationPreferences(instituteId: string) {
        const notificationPreferenceRepository = await getNotificationPreferenceRepository();
        return notificationPreferenceRepository.getOrCreateByInstituteId(instituteId);
    },

    async updateNotificationPreferences(
        instituteId: string,
        payload: Partial<{
            newEnquiryAlert: boolean;
            followUpReminder: boolean;
            leadAssigned: boolean;
            paymentReceived: boolean;
            admissionConfirmed: boolean;
        }>
    ) {
        const notificationPreferenceRepository = await getNotificationPreferenceRepository();
        return notificationPreferenceRepository.updateByInstituteId(instituteId, payload);
    },

    async isNotificationEnabled(
        instituteId: string,
        event:
            | "new_enquiry_alert"
            | "follow_up_reminder"
            | "lead_assigned"
            | "payment_received"
            | "admission_confirmed"
    ) {
        const prefs = await this.getNotificationPreferences(instituteId);

        if (event === "new_enquiry_alert") return prefs.newEnquiryAlert;
        if (event === "follow_up_reminder") return prefs.followUpReminder;
        if (event === "lead_assigned") return prefs.leadAssigned;
        if (event === "payment_received") return prefs.paymentReceived;
        return prefs.admissionConfirmed;
    },
};

