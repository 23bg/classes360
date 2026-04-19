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
            description?: string | null;
            address?: string | null;
            phone?: string | null;
            email?: string | null;
            website?: string | null;
            whatsapp?: string | null;
            supportPhone?: string | null;
            supportEmail?: string | null;
            officeAddress?: string | null;
            services?: string[] | null;
            teachers?: Array<{ photo?: string | null; name?: string | null; subject?: string | null; experience?: string | null; bio?: string | null }> | null;
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
    teachers?: Array<{ photo?: string | null; name?: string | null; subject?: string | null; experience?: string | null; bio?: string | null }>;
};

export type StudentPortalState = {
    data: PortalData | null;
    loading: boolean;
    error: string | null;
    authLoading: boolean;
};
