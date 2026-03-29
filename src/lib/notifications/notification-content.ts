import type { NotificationEvent } from "@/lib/notifications/event-catalog";

export type NotificationContentInput = {
    event: NotificationEvent;
    title?: string;
    message?: string;
};

const toTitleCase = (value: string): string =>
    value
        .toLowerCase()
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

const DEFAULT_MESSAGE_BY_EVENT: Partial<Record<NotificationEvent, string>> = {
    LEAD_CREATED: "A new lead has been created.",
    LEAD_STATUS_CHANGED: "Lead status has been updated.",
    FOLLOW_UP_SCHEDULED: "A follow-up has been scheduled.",
    FOLLOW_UP_COMPLETED: "A follow-up has been completed.",
    LEAD_CONVERTED_TO_STUDENT: "A lead has been converted to student.",
    STUDENT_CREATED: "A new student has been added.",
    STUDENT_UPDATED: "Student profile has been updated.",
    STUDENT_PORTAL_CREDENTIALS_CREATED: "Student portal credentials have been created.",
    PAYMENT_RECEIVED: "A payment has been received.",
    PAYMENT_FAILED: "A payment attempt failed.",
    ANNOUNCEMENT_CREATED: "A new announcement was published.",
    INSTITUTE_ONBOARDING_COMPLETED: "Institute onboarding is completed.",
};

export const resolveNotificationContent = (input: NotificationContentInput): { title: string; message: string } => {
    const title = input.title?.trim() || toTitleCase(input.event);
    const message = input.message?.trim() || DEFAULT_MESSAGE_BY_EVENT[input.event] || `${toTitleCase(input.event)} event occurred.`;

    return { title, message };
};
