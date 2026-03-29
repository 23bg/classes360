type AsyncState<T> = {
    data: T;
    loading: boolean;
    error: string | null;
};

export type InstituteFormData = {
    name: string;
    slug: string;
    description: string;
    phone: string;
    whatsapp: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    region: string;
    postalCode: string;
    country: string;
    countryCode: string;
    timings: string;
    logo: string;
    banner: string;
    website: string;
    instagram: string;
    facebook: string;
    youtube: string;
    linkedin: string;
};

export type InstituteSummary = {
    form: InstituteFormData;
    studentsCount: number;
    coursesCount: number;
};

export type DomainStatus = "PENDING" | "VERIFIED" | "ACTIVE" | "FAILED";

export type DomainSettings = {
    slug: string;
    customDomain: string;
    domainVerified: boolean;
    domainStatus: DomainStatus;
    defaultDomain: string;
    dnsInstruction: {
        type: string;
        name: string;
        target: string;
    };
};

export type DataCounts = {
    students: number;
    leads: number;
    courses: number;
    payments: number;
};

export type AppInstituteState = {
    summary: AsyncState<InstituteSummary | null>;
    domain: AsyncState<DomainSettings | null>;
    counts: AsyncState<DataCounts>;
    exportData: AsyncState<Record<string, unknown> | null>;
    onboarding: {
        loading: boolean;
        error: string | null;
        data: Record<string, unknown> | null;
    };
    publicEnquiry: {
        loading: boolean;
        error: string | null;
    };
};
