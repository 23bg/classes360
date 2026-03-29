import { PLAN_CONFIG, type PlanType } from "@/config/plans";

export type FeatureId =
    | "publicInstitutePage"
    | "freeClasses360Page"
    | "captureEnquiries"
    | "enquiryTrackingFollowUps"
    | "studentCourseManagement"
    | "excelImport"
    | "razorpayPayments"
    | "userAccounts"
    | "separateTeamAccounts"
    | "assignEnquiries"
    | "trackOwnership"
    | "whatsAppAlerts"
    | "whatsAppBusinessNumberIntegration"
    | "customDomain"
    | "removeClasses360Branding"
    | "whiteLabelSystem"
    | "highVolumeSupport";

export type FeatureDefinition = {
    id: FeatureId;
    label: string;
};

export type FeatureGroupDefinition = {
    id: string;
    title: string;
    features: FeatureDefinition[];
};

export const featureGroups: FeatureGroupDefinition[] = [
    {
        id: "coreSystem",
        title: "Core System",
        features: [
            { id: "publicInstitutePage", label: "Public institute page" },
            { id: "freeClasses360Page", label: "Free Classes360 page" },
            { id: "captureEnquiries", label: "Capture enquiries (QR, links, website)" },
            { id: "enquiryTrackingFollowUps", label: "Enquiry tracking & follow-ups" },
            { id: "studentCourseManagement", label: "Student & course management" },
            { id: "excelImport", label: "Excel import" },
            { id: "razorpayPayments", label: "Razorpay payments" },
        ],
    },
    {
        id: "team",
        title: "Team",
        features: [
            { id: "userAccounts", label: "User accounts" },
            { id: "separateTeamAccounts", label: "Separate team accounts" },
            { id: "assignEnquiries", label: "Assign enquiries" },
            { id: "trackOwnership", label: "Track ownership" },
        ],
    },
    {
        id: "communication",
        title: "Communication",
        features: [
            { id: "whatsAppAlerts", label: "WhatsApp alerts" },
            {
                id: "whatsAppBusinessNumberIntegration",
                label: "WhatsApp Business number integration",
            },
        ],
    },
    {
        id: "branding",
        title: "Branding",
        features: [
            { id: "customDomain", label: "Custom domain" },
            { id: "removeClasses360Branding", label: "Remove Classes360 branding" },
            { id: "whiteLabelSystem", label: "White-label system" },
            { id: "highVolumeSupport", label: "High-volume support" },
        ],
    },
];

export type PlanDefinition = {
    key: PlanType;
    name: string;
    description: string;
    cta: string;
    link: string;
    highlight?: boolean;
};

export const planDefinitions: PlanDefinition[] = [
    {
        key: "STARTER",
        name: "Starter",
        description: "Best for single-owner institutes starting a structured admission workflow.",
        cta: "Start Starter",
        link: "/signup",
    },
    {
        key: "TEAM",
        name: "Team",
        description: "Built for small teams managing admissions together every day.",
        cta: "Start Team",
        link: "/signup",
        highlight: true,
    },
    {
        key: "GROWTH",
        name: "Growth",
        description: "For institutes scaling counsellor operations and admissions volume.",
        cta: "Start Growth",
        link: "/signup",
    },
    {
        key: "SCALE",
        name: "Scale",
        description: "For multi-team institutes that need advanced branding and high-volume support.",
        cta: "Talk to Sales",
        link: "/contact",
    },
];

export type PlanFeatureAvailability = {
    included: boolean;
    value?: string;
};

export const planFeatureMatrix: Record<PlanType, Record<FeatureId, PlanFeatureAvailability>> = {
    STARTER: {
        publicInstitutePage: { included: true },
        freeClasses360Page: { included: true },
        captureEnquiries: { included: true },
        enquiryTrackingFollowUps: { included: true },
        studentCourseManagement: { included: true },
        excelImport: { included: true },
        razorpayPayments: { included: true },
        userAccounts: { included: true, value: "1 user" },
        separateTeamAccounts: { included: false },
        assignEnquiries: { included: false },
        trackOwnership: { included: false },
        whatsAppAlerts: { included: true },
        whatsAppBusinessNumberIntegration: { included: true },
        customDomain: { included: false },
        removeClasses360Branding: { included: false },
        whiteLabelSystem: { included: false },
        highVolumeSupport: { included: false },
    },
    TEAM: {
        publicInstitutePage: { included: true },
        freeClasses360Page: { included: true },
        captureEnquiries: { included: true },
        enquiryTrackingFollowUps: { included: true },
        studentCourseManagement: { included: true },
        excelImport: { included: true },
        razorpayPayments: { included: true },
        userAccounts: { included: true, value: "Up to 5 users" },
        separateTeamAccounts: { included: true },
        assignEnquiries: { included: true },
        trackOwnership: { included: true },
        whatsAppAlerts: { included: true },
        whatsAppBusinessNumberIntegration: { included: true },
        customDomain: { included: false },
        removeClasses360Branding: { included: false },
        whiteLabelSystem: { included: false },
        highVolumeSupport: { included: false },
    },
    GROWTH: {
        publicInstitutePage: { included: true },
        freeClasses360Page: { included: true },
        captureEnquiries: { included: true },
        enquiryTrackingFollowUps: { included: true },
        studentCourseManagement: { included: true },
        excelImport: { included: true },
        razorpayPayments: { included: true },
        userAccounts: { included: true, value: "Up to 20 users" },
        separateTeamAccounts: { included: true },
        assignEnquiries: { included: true },
        trackOwnership: { included: true },
        whatsAppAlerts: { included: true },
        whatsAppBusinessNumberIntegration: { included: true },
        customDomain: { included: true },
        removeClasses360Branding: { included: true },
        whiteLabelSystem: { included: false },
        highVolumeSupport: { included: false },
    },
    SCALE: {
        publicInstitutePage: { included: true },
        freeClasses360Page: { included: true },
        captureEnquiries: { included: true },
        enquiryTrackingFollowUps: { included: true },
        studentCourseManagement: { included: true },
        excelImport: { included: true },
        razorpayPayments: { included: true },
        userAccounts: { included: true, value: "Unlimited users" },
        separateTeamAccounts: { included: true },
        assignEnquiries: { included: true },
        trackOwnership: { included: true },
        whatsAppAlerts: { included: true },
        whatsAppBusinessNumberIntegration: { included: true },
        customDomain: { included: true },
        removeClasses360Branding: { included: true },
        whiteLabelSystem: { included: true },
        highVolumeSupport: { included: true },
    },
};

export const formatPlanPrice = (planType: PlanType, yearlyBilling: boolean) => {
    const amount = yearlyBilling ? PLAN_CONFIG[planType].priceYearly : PLAN_CONFIG[planType].priceMonthly;
    return amount.toLocaleString("en-IN");
};
