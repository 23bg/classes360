export const NOTIFICATION_CHANNELS = [
    "IN_APP_ADMIN",
    "IN_APP_STUDENT_PORTAL",
    "WHATSAPP_ONCAMPUS",
    "WHATSAPP_INSTITUTE",
    "EMAIL",
] as const;

export type NotificationChannel = (typeof NOTIFICATION_CHANNELS)[number];

export const NOTIFICATION_AUDIENCES = [
    "INSTITUTE_OWNER",
    "INSTITUTE_TEAM_MEMBER",
    "INSTITUTE_USERS",
    "STUDENT",
] as const;

export type NotificationAudience = (typeof NOTIFICATION_AUDIENCES)[number];

export const WHATSAPP_SENDER_TYPES = [
    "ONCAMPUS_SYSTEM_NUMBER",
    "INSTITUTE_WHATSAPP_NUMBER",
] as const;

export type WhatsAppSenderType = (typeof WHATSAPP_SENDER_TYPES)[number];

export const NOTIFICATION_EVENTS = [
    "PUBLIC_ENQUIRY_SUBMITTED",
    "PUBLIC_ENQUIRY_CONFIRMATION",

    "LEAD_CREATED",
    "LEAD_ASSIGNED",
    "LEAD_STATUS_CHANGED",
    "LEAD_NOTE_ADDED",
    "FOLLOW_UP_SCHEDULED",
    "FOLLOW_UP_COMPLETED",
    "FOLLOW_UP_REMINDER",
    "LEAD_CONVERTED_TO_STUDENT",

    "STUDENT_CREATED",
    "STUDENT_UPDATED",
    "STUDENT_BATCH_CHANGED",
    "STUDENT_COURSE_CHANGED",
    "STUDENT_PORTAL_CREDENTIALS_CREATED",

    "COURSE_CREATED",
    "COURSE_UPDATED",
    "COURSE_NOTE_PUBLISHED",
    "BATCH_CREATED",
    "BATCH_UPDATED",
    "TEACHER_ASSIGNED_TO_BATCH",

    "FEE_PLAN_CREATED",
    "INSTALLMENT_ADDED",
    "PAYMENT_RECEIVED",
    "PAYMENT_FAILED",
    "FEE_DUE_REMINDER",

    "ANNOUNCEMENT_CREATED",

    "TEAM_MEMBER_ADDED",
    "TEAM_MEMBER_ROLE_UPDATED",
    "TEAM_MEMBER_REMOVED",

    "INSTITUTE_PROFILE_UPDATED",
    "INSTITUTE_ONBOARDING_COMPLETED",

    "TRIAL_STARTED",
    "TRIAL_ENDING_SOON",
    "SUBSCRIPTION_CREATED",
    "SUBSCRIPTION_PAYMENT_SUCCESS",
    "SUBSCRIPTION_PAYMENT_FAILED",
    "SUBSCRIPTION_CANCELLED",

    "PORTAL_LOGIN",
    "PORTAL_PASSWORD_CHANGED",
    "NEW_ANNOUNCEMENT_AVAILABLE",
    "NEW_PAYMENT_RECORDED",
    "FEE_DUE_SOON",
] as const;

export type NotificationEvent = (typeof NOTIFICATION_EVENTS)[number];

export type NotificationEventRule = {
    channels: NotificationChannel[];
    defaultAudiences: NotificationAudience[];
    audiencesByChannel?: Partial<Record<NotificationChannel, NotificationAudience[]>>;
    whatsappSenderType?: WhatsAppSenderType;
};

export const NOTIFICATION_EVENT_RULES: Record<NotificationEvent, NotificationEventRule> = {
    PUBLIC_ENQUIRY_SUBMITTED: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS"],
        defaultAudiences: ["INSTITUTE_USERS"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },
    PUBLIC_ENQUIRY_CONFIRMATION: {
        channels: ["WHATSAPP_INSTITUTE", "EMAIL"],
        defaultAudiences: ["STUDENT"],
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },

    LEAD_CREATED: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS"],
        defaultAudiences: ["INSTITUTE_USERS"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },
    LEAD_ASSIGNED: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS"],
        defaultAudiences: ["INSTITUTE_TEAM_MEMBER"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },
    LEAD_STATUS_CHANGED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    LEAD_NOTE_ADDED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    FOLLOW_UP_SCHEDULED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_TEAM_MEMBER"],
    },
    FOLLOW_UP_COMPLETED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    FOLLOW_UP_REMINDER: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS"],
        defaultAudiences: ["INSTITUTE_TEAM_MEMBER"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },
    LEAD_CONVERTED_TO_STUDENT: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS"],
        defaultAudiences: ["INSTITUTE_OWNER"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },

    STUDENT_CREATED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    STUDENT_UPDATED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    STUDENT_BATCH_CHANGED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
            WHATSAPP_INSTITUTE: ["STUDENT"],
        },
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },
    STUDENT_COURSE_CHANGED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
            WHATSAPP_INSTITUTE: ["STUDENT"],
        },
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },
    STUDENT_PORTAL_CREDENTIALS_CREATED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE", "EMAIL"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
            WHATSAPP_INSTITUTE: ["STUDENT"],
            EMAIL: ["STUDENT"],
        },
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },

    COURSE_CREATED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    COURSE_UPDATED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
        },
    },
    COURSE_NOTE_PUBLISHED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
        },
    },
    BATCH_CREATED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    BATCH_UPDATED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
            WHATSAPP_INSTITUTE: ["STUDENT"],
        },
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },
    TEACHER_ASSIGNED_TO_BATCH: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
        },
    },

    FEE_PLAN_CREATED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
        },
    },
    INSTALLMENT_ADDED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
        },
    },
    PAYMENT_RECEIVED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE", "EMAIL"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
            WHATSAPP_INSTITUTE: ["STUDENT"],
            EMAIL: ["STUDENT"],
        },
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },
    PAYMENT_FAILED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE", "EMAIL"],
        defaultAudiences: ["INSTITUTE_USERS", "STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
            WHATSAPP_INSTITUTE: ["STUDENT"],
            EMAIL: ["STUDENT"],
        },
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },
    FEE_DUE_REMINDER: {
        channels: ["IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE", "EMAIL"],
        defaultAudiences: ["STUDENT"],
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },

    ANNOUNCEMENT_CREATED: {
        channels: ["IN_APP_ADMIN", "IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE", "EMAIL"],
        defaultAudiences: ["STUDENT"],
        audiencesByChannel: {
            IN_APP_ADMIN: ["INSTITUTE_USERS"],
            IN_APP_STUDENT_PORTAL: ["STUDENT"],
            WHATSAPP_INSTITUTE: ["STUDENT"],
            EMAIL: ["STUDENT"],
        },
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },

    TEAM_MEMBER_ADDED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    TEAM_MEMBER_ROLE_UPDATED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    TEAM_MEMBER_REMOVED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },

    INSTITUTE_PROFILE_UPDATED: {
        channels: ["IN_APP_ADMIN"],
        defaultAudiences: ["INSTITUTE_USERS"],
    },
    INSTITUTE_ONBOARDING_COMPLETED: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS"],
        defaultAudiences: ["INSTITUTE_USERS"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },

    TRIAL_STARTED: {
        channels: ["IN_APP_ADMIN", "EMAIL"],
        defaultAudiences: ["INSTITUTE_OWNER"],
    },
    TRIAL_ENDING_SOON: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS", "EMAIL"],
        defaultAudiences: ["INSTITUTE_OWNER"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },
    SUBSCRIPTION_CREATED: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS", "EMAIL"],
        defaultAudiences: ["INSTITUTE_OWNER"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },
    SUBSCRIPTION_PAYMENT_SUCCESS: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS", "EMAIL"],
        defaultAudiences: ["INSTITUTE_OWNER"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },
    SUBSCRIPTION_PAYMENT_FAILED: {
        channels: ["IN_APP_ADMIN", "WHATSAPP_ONCAMPUS", "EMAIL"],
        defaultAudiences: ["INSTITUTE_OWNER"],
        whatsappSenderType: "ONCAMPUS_SYSTEM_NUMBER",
    },
    SUBSCRIPTION_CANCELLED: {
        channels: ["IN_APP_ADMIN", "EMAIL"],
        defaultAudiences: ["INSTITUTE_OWNER"],
    },

    PORTAL_LOGIN: {
        channels: ["IN_APP_STUDENT_PORTAL"],
        defaultAudiences: ["STUDENT"],
    },
    PORTAL_PASSWORD_CHANGED: {
        channels: ["IN_APP_STUDENT_PORTAL"],
        defaultAudiences: ["STUDENT"],
    },
    NEW_ANNOUNCEMENT_AVAILABLE: {
        channels: ["IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE"],
        defaultAudiences: ["STUDENT"],
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },
    NEW_PAYMENT_RECORDED: {
        channels: ["IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE"],
        defaultAudiences: ["STUDENT"],
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },
    FEE_DUE_SOON: {
        channels: ["IN_APP_STUDENT_PORTAL", "WHATSAPP_INSTITUTE"],
        defaultAudiences: ["STUDENT"],
        whatsappSenderType: "INSTITUTE_WHATSAPP_NUMBER",
    },
};

export const WHATSAPP_CHANNEL_SET = new Set<NotificationChannel>([
    "WHATSAPP_ONCAMPUS",
    "WHATSAPP_INSTITUTE",
]);

export const hasChannelForEvent = (event: NotificationEvent, channel: NotificationChannel): boolean =>
    NOTIFICATION_EVENT_RULES[event].channels.includes(channel);

export const supportsWhatsAppForEvent = (event: NotificationEvent): boolean =>
    NOTIFICATION_EVENT_RULES[event].channels.some((channel) => WHATSAPP_CHANNEL_SET.has(channel));

export const getPreferredWhatsAppSenderType = (event: NotificationEvent): WhatsAppSenderType | null => {
    const rule = NOTIFICATION_EVENT_RULES[event];
    if (!supportsWhatsAppForEvent(event)) return null;
    return rule.whatsappSenderType ?? "ONCAMPUS_SYSTEM_NUMBER";
};

export const getEventAudiences = (
    event: NotificationEvent,
    channel?: NotificationChannel
): NotificationAudience[] => {
    const rule = NOTIFICATION_EVENT_RULES[event];
    if (!channel) return rule.defaultAudiences;
    return rule.audiencesByChannel?.[channel] ?? rule.defaultAudiences;
};




