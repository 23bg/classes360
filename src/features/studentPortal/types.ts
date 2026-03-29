export type PortalData = {
    student?: {
        name?: string;
        admissionDate?: string;
        email?: string | null;
        phone?: string | null;
        institute?: {
            name?: string | null;
            logo?: string | null;
            logoUrl?: string | null;
        } | null;
        course?: { name: string; duration?: string | null; description?: string | null } | null;
        batch?: {
            name?: string;
            startDate?: string | null;
            time?: string | null;
            timing?: string | null;
            teacherName?: string | null;
            faculty?: string | null;
            liveClassLink?: string | null;
            recordedLecturesLink?: string | null;
            studyMaterialLink?: string | null;
        } | null;
        totalFees?: number | null;
        paidAmount?: number | null;
        pendingAmount?: number | null;
        nextDueDate?: string | null;
        liveClassLink?: string | null;
        recordedLecturesLink?: string | null;
        studyMaterialLink?: string | null;
    };
    announcements?: Array<{ title: string; body: string; createdAt: string }>;
};

export type StudentPortalState = {
    data: PortalData | null;
    loading: boolean;
    error: string | null;
    authLoading: boolean;
};
