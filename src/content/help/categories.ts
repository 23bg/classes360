export const HELP_CATEGORY_ORDER = [
    "gettingStarted",
    "managingEnquiries",
    "students",
    "coursesAndBatches",
    "feesAndBilling",
    "whatsappAndNotifications",
    "faq",
] as const;

export type HelpCategory = (typeof HELP_CATEGORY_ORDER)[number];

export const HELP_CATEGORY_LABELS: Record<HelpCategory, string> = {
    gettingStarted: "Getting Started",
    managingEnquiries: "Managing Enquiries",
    students: "Students",
    coursesAndBatches: "Courses & Batches",
    feesAndBilling: "Fees & Billing",
    whatsappAndNotifications: "WhatsApp & Notifications",
    faq: "FAQ",
};
