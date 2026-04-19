import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API } from "@/constants/api";
import api from "@/lib/axios";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/apiService";

type RequestState<T> = {
    data: T;
    loading: boolean;
    error: string | null;
};

type MutationState = {
    loading: boolean;
    error: string | null;
};

type Course = {
    id: string;
    name: string;
    banner?: string | null;
    duration?: string | null;
    defaultFees?: number | null;
    description?: string | null;
};

type Teacher = {
    id: string;
    name: string;
    subject?: string | null;
    bio?: string | null;
};

type Batch = {
    id: string;
    courseId: string;
    name: string;
    startDate?: string | null;
    schedule?: string | null;
    teacherId?: string | null;
};

type Student = {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    courseId?: string | null;
    batchId?: string | null;
    admissionDate?: string | null;
};

type FeeSummary = { totalFees: number; totalPaid: number; totalPending: number };

type StudentAssignment = {
    id: string;
    courseId: string;
    batchId?: string | null;
    joinedAt: string;
    status: "ACTIVE" | "COMPLETED" | "DROPPED";
    courseName: string;
    batchName?: string | null;
    batchStartDate?: string | null;
};

type UploadResult = {
    inserted: number;
    errors: Array<{ row: number; message: string }>;
};

type BatchNote = { id: string; title: string; description?: string | null; fileUrl?: string | null; createdAt: string };
type BatchAttendance = { id: string; studentId: string; date: string; status: "PRESENT" | "ABSENT" };

type FeePlan = {
    id: string;
    studentId: string;
    totalAmount: number;
    dueDate?: string | null;
    createdAt: string;
};

type Payment = {
    id: string;
    feePlanId: string;
    amount: number;
    status: "PENDING" | "PAID" | "OVERDUE";
    paidOn?: string | null;
    note?: string | null;
};

type PaymentRow = {
    id: string;
    amount: number;
    method?: string | null;
    reference?: string | null;
    paidOn: string;
    student: {
        id: string;
        name: string;
        phone: string;
    };
};

type Defaulter = {
    studentId: string;
    studentName: string;
    phone: string;
    courseName: string;
    totalFees: number;
    totalPaid: number;
    pending: number;
    dueDate?: string | null;
};

type Lead = {
    id: string;
    name: string;
    phone: string;
    email?: string | null;
    course?: string | null;
    source?: string | null;
    status: string;
    message?: string | null;
    followUpAt?: string | null;
    createdAt: string;
};

type LeadActivity = {
    activityType: string;
    title: string;
    description?: string;
    createdAt: string;
};

type LeadImportSummary = {
    totalRows: number;
    validRows: number;
    failedRows: number;
    duplicateRows: number;
    imported: number;
    errors: Array<{ row: number; message: string }>;
    duplicates: Array<{ row: number; phone: string }>;
    preview: Array<{
        name: string;
        email?: string;
        phone: string;
        course?: string;
        source?: string;
        city?: string;
    }>;
};

type Metrics = {
    leadsThisMonth: number;
    admissionsThisMonth: number;
    totalStudents: number;
    conversionPercentage: number;
    totalFeesCollectedThisMonth: number;
    totalOutstandingFees: number;
    todayOverview?: {
        newLeads: number;
        feesCollected: number;
        feesDueToday: number;
        newStudents: number;
    };
    recentLeads?: Array<{
        id: string;
        name: string;
        phone: string;
        status: string;
        createdAt: string;
    }>;
    recentPayments?: Array<{
        id: string;
        amount: number;
        method?: string | null;
        paidOn: string;
        student: {
            name: string;
            phone: string;
        };
    }>;
    followUpOverview?: {
        todayCount: number;
        overdueCount: number;
        todaysFollowUps: Array<{
            id: string;
            name: string;
            phone: string;
            followUpAt?: string | null;
            status: string;
        }>;
        overdueFollowUps: Array<{
            id: string;
            name: string;
            phone: string;
            followUpAt?: string | null;
            status: string;
        }>;
    };
};

type DashboardOverviewResponse = {
    metrics: Metrics;
    defaulters: Defaulter[];
};

type NotificationPreferences = {
    newEnquiryAlert: boolean;
    followUpReminder: boolean;
    leadAssigned: boolean;
    paymentReceived: boolean;
    admissionConfirmed: boolean;
};

type WhatsAppIntegrationState = {
    mode: "CLASSES360_SHARED" | "INSTITUTE_CUSTOM";
    connectedNumber: string | null;
    status: "PENDING" | "VERIFIED" | "ACTIVE" | "DISCONNECTED" | "FAILED";
    phoneNumberId: string | null;
    businessAccountId: string | null;
    connectedAt: string | null;
};

type InstituteProfile = {
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
    heroImage?: string;
    banner?: string;
    googleMapLink?: string;
    website: string;
    instagram: string;
    facebook: string;
    youtube: string;
    linkedin: string;
};

type BillingSummary = {
    planType: string;
    planName?: string;
    planAmount: number;
    planAmountYearly?: number;
    pricingVersion?: string;
    currency: string;
    userLimit: number | null;
    usersUsed: number;
    status: string;
    billingInterval?: string;
    autopayEnabled?: boolean;
    paymentMethodAddedAt?: string | null;
    trialDaysRemaining?: number | null;
    trialPaymentReminder?: boolean;
    nextBillingDate?: string | null;
    razorpaySubId?: string | null;
    lastPaymentAmount?: number | null;
    lastPaymentDate?: string | null;
};

type BillingCheckoutSession = {
    provider: "RAZORPAY" | "STRIPE";
    region: "IN" | "GLOBAL" | "UNKNOWN";
    checkoutMode: "subscription" | "payment";
    planType: string;
    interval: string;
    currency: string;
    amount: number;
    taxes: number;
    totalAmount: number;
    checkoutSessionId?: string | null;
    providerSubscriptionId?: string | null;
    providerPaymentId?: string | null;
    providerPaymentLinkId?: string | null;
    checkoutUrl?: string | null;
    clientSecret?: string | null;
    publishableKey?: string | null;
    paymentMethods: Array<"CARD" | "UPI" | "NETBANKING" | "APPLE_PAY" | "GOOGLE_PAY" | "PAYPAL">;
    redirectRequired: boolean;
    regionLabel: string;
};

type UsageSummary = {
    planType: string;
    alertsUsed: number;
    alertsIncluded: number;
    extraAlerts: number;
    extraAlertRate: number;
    estimatedUsageCost: number;
};

type InvoiceHistoryItem = {
    id: string;
    month: number;
    year: number;
    periodStart: string;
    periodEnd: string;
    planCharge: number;
    usageCharge: number;
    totalAmount: number;
    couponCode?: string | null;
    originalAmount?: number | null;
    discountAmount?: number | null;
    finalAmount?: number | null;
    status: "PENDING" | "ISSUED" | "PAID" | "OVERDUE" | "VOID";
    dueDate?: string | null;
    issuedAt?: string | null;
    paidAt?: string | null;
    paymentLinkUrl?: string | null;
    downloadUrl?: string | null;
};

type BillingDashboardPayload = {
    billingContact: {
        name: string;
        email: string | null;
    };
    institute: {
        id: string;
        name: string | null;
        country: string | null;
        countryCode: string | null;
    };
    summary: BillingSummary;
    usage: UsageSummary;
    checkout: {
        provider: "RAZORPAY" | "STRIPE";
        region: "IN" | "GLOBAL" | "UNKNOWN";
        regionLabel: string;
        country?: string | null;
        recommendedProvider?: "RAZORPAY" | "STRIPE" | null;
        allowedProviders: Array<"RAZORPAY" | "STRIPE">;
        currency: string;
        taxRate: number;
    };
    policy: {
        hasOverdue: boolean;
        alertsEnabled: boolean;
        accessRestricted: boolean;
        hasExhaustedPendingInvoice?: boolean;
        notifyPaymentMethodUpdate?: boolean;
    };
    sender?: {
        mode: "CLASSES360_SHARED" | "INSTITUTE_CUSTOM";
        connectedNumber?: string | null;
        status?: string;
    };
    invoices: InvoiceHistoryItem[];
};

type IntegrationItem = {
    id: string;
    provider: "WHATSAPP" | "EMAIL" | "RAZORPAY";
    status: "CONNECTED" | "DISCONNECTED" | "DEGRADED";
    config?: Record<string, unknown> | null;
    updatedAt: string;
};

type DashboardState = {
    courses: RequestState<Course[]> & { mutation: MutationState };
    teachers: RequestState<Teacher[]> & { mutation: MutationState };
    students: RequestState<{
        rows: Student[];
        courses: Course[];
        batches: Batch[];
        feeSummaries: Record<string, FeeSummary>;
    }> & {
        mutation: MutationState;
        assignments: RequestState<StudentAssignment[]>;
        upload: { loading: boolean; error: string | null; result: UploadResult | null };
    };
    batches: RequestState<{
        rows: Batch[];
        courses: Course[];
        teachers: Teacher[];
        students: Student[];
    }> & {
        mutation: MutationState;
        details: RequestState<{ notes: BatchNote[]; attendance: BatchAttendance[] }>;
        noteMutation: MutationState;
        attendanceMutation: MutationState;
    };
    fees: RequestState<{ plans: FeePlan[]; students: Student[] }> & {
        planMutation: MutationState;
        payments: RequestState<Payment[]>;
        paymentMutation: MutationState;
    };
    payments: RequestState<PaymentRow[]>;
    defaulters: RequestState<Defaulter[]>;
    leads: RequestState<Lead[]> & {
        mutation: MutationState;
        timeline: RequestState<LeadActivity[]>;
        import: { loading: boolean; error: string | null; summary: LeadImportSummary | null };
    };
    overview: RequestState<DashboardOverviewResponse | null> & {
        announcement: MutationState;
    };
    profile: RequestState<InstituteProfile | null> & { mutation: MutationState };
    notifications: RequestState<NotificationPreferences> & { mutation: MutationState };
    whatsapp: RequestState<WhatsAppIntegrationState> & { mutation: MutationState };
    billing: RequestState<BillingDashboardPayload | null> & {
        subscription: MutationState & {
            checkout: BillingCheckoutSession | null;
        };
        invoice: MutationState;
        retry: MutationState & { invoiceId: string | null };
        confirm: MutationState;
    };
    integrations: RequestState<IntegrationItem[]>;
};

const DEFAULT_PREFS: NotificationPreferences = {
    newEnquiryAlert: true,
    followUpReminder: true,
    leadAssigned: true,
    paymentReceived: true,
    admissionConfirmed: true,
};

const DEFAULT_WHATSAPP: WhatsAppIntegrationState = {
    mode: "CLASSES360_SHARED",
    connectedNumber: null,
    status: "DISCONNECTED",
    phoneNumberId: null,
    businessAccountId: null,
    connectedAt: null,
};

const initialState: DashboardState = {
    courses: { data: [], loading: false, error: null, mutation: { loading: false, error: null } },
    teachers: { data: [], loading: false, error: null, mutation: { loading: false, error: null } },
    students: {
        data: { rows: [], courses: [], batches: [], feeSummaries: {} },
        loading: false,
        error: null,
        mutation: { loading: false, error: null },
        assignments: { data: [], loading: false, error: null },
        upload: { loading: false, error: null, result: null },
    },
    batches: {
        data: { rows: [], courses: [], teachers: [], students: [] },
        loading: false,
        error: null,
        mutation: { loading: false, error: null },
        details: { data: { notes: [], attendance: [] }, loading: false, error: null },
        noteMutation: { loading: false, error: null },
        attendanceMutation: { loading: false, error: null },
    },
    fees: {
        data: { plans: [], students: [] },
        loading: false,
        error: null,
        planMutation: { loading: false, error: null },
        payments: { data: [], loading: false, error: null },
        paymentMutation: { loading: false, error: null },
    },
    payments: { data: [], loading: false, error: null },
    defaulters: { data: [], loading: false, error: null },
    leads: {
        data: [],
        loading: false,
        error: null,
        mutation: { loading: false, error: null },
        timeline: { data: [], loading: false, error: null },
        import: { loading: false, error: null, summary: null },
    },
    overview: { data: null, loading: false, error: null, announcement: { loading: false, error: null } },
    profile: { data: null, loading: false, error: null, mutation: { loading: false, error: null } },
    notifications: { data: DEFAULT_PREFS, loading: false, error: null, mutation: { loading: false, error: null } },
    whatsapp: { data: DEFAULT_WHATSAPP, loading: false, error: null, mutation: { loading: false, error: null } },
    billing: {
        data: null,
        loading: false,
        error: null,
        subscription: { loading: false, error: null, checkout: null },
        invoice: { loading: false, error: null },
        retry: { loading: false, error: null, invoiceId: null },
        confirm: { loading: false, error: null },
    },
    integrations: { data: [], loading: false, error: null },
};

const getErrorMessage = (error: unknown) =>
    (error as { message?: string })?.message || "Request failed";

export const fetchCourses = createAsyncThunk("dashboard/fetchCourses", async () =>
    await apiGet<Course[]>(API.INTERNAL.COURSES.ROOT)
);

export const saveCourse = createAsyncThunk(
    "dashboard/saveCourse",
    async ({ editingId, body }: { editingId: string | null; body: Record<string, unknown> }) => {
        if (editingId) {
            await apiPatch(API.INTERNAL.COURSES.BY_ID(editingId), body);
        } else {
            await apiPost(API.INTERNAL.COURSES.ROOT, body);
        }
        return true;
    }
);

export const deleteCourse = createAsyncThunk("dashboard/deleteCourse", async (id: string) => {
    await apiDelete(API.INTERNAL.COURSES.BY_ID(id));
    return id;
});

export const fetchTeachers = createAsyncThunk("dashboard/fetchTeachers", async () =>
    await apiGet<Teacher[]>(API.INTERNAL.TEACHERS.ROOT)
);

export const saveTeacher = createAsyncThunk(
    "dashboard/saveTeacher",
    async ({ editingId, body }: { editingId: string | null; body: Record<string, unknown> }) => {
        if (editingId) {
            await apiPatch(API.INTERNAL.TEACHERS.BY_ID(editingId), body);
        } else {
            await apiPost(API.INTERNAL.TEACHERS.ROOT, body);
        }
        return true;
    }
);

export const deleteTeacher = createAsyncThunk("dashboard/deleteTeacher", async (id: string) => {
    await apiDelete(API.INTERNAL.TEACHERS.BY_ID(id));
    return id;
});

export const fetchStudentsDashboard = createAsyncThunk("dashboard/fetchStudentsDashboard", async () => {
    const [students, courses, batches] = await Promise.all([
        apiGet<Student[]>(API.INTERNAL.STUDENTS.ROOT),
        apiGet<Course[]>(API.INTERNAL.COURSES.ROOT),
        apiGet<Batch[]>(API.INTERNAL.BATCHES.ROOT),
    ]);

    const feeSummaries: Record<string, FeeSummary> = {};
    await Promise.all(
        (students ?? []).map(async (student) => {
            try {
                const feeData = await apiGet<FeeSummary>(API.INTERNAL.FEES.WITH_STUDENT(student.id));
                if (feeData) {
                    feeSummaries[student.id] = {
                        totalFees: feeData.totalFees ?? 0,
                        totalPaid: feeData.totalPaid ?? 0,
                        totalPending: feeData.totalPending ?? 0,
                    };
                }
            } catch {
                feeSummaries[student.id] = { totalFees: 0, totalPaid: 0, totalPending: 0 };
            }
        })
    );

    return {
        rows: students ?? [],
        courses: courses ?? [],
        batches: batches ?? [],
        feeSummaries,
    };
});

export const saveStudent = createAsyncThunk(
    "dashboard/saveStudent",
    async ({ editingId, body }: { editingId: string | null; body: Record<string, unknown> }) => {
        if (editingId) {
            await apiPatch(API.INTERNAL.STUDENTS.BY_ID(editingId), body);
        } else {
            await apiPost(API.INTERNAL.STUDENTS.ROOT, body);
        }
        return true;
    }
);

export const deleteStudent = createAsyncThunk("dashboard/deleteStudent", async (id: string) => {
    await apiDelete(API.INTERNAL.STUDENTS.BY_ID(id));
    return id;
});

export const fetchStudentAssignments = createAsyncThunk("dashboard/fetchStudentAssignments", async (studentId: string) =>
    await apiGet<StudentAssignment[]>(API.INTERNAL.STUDENTS.COURSES(studentId))
);

export const assignStudentCourse = createAsyncThunk(
    "dashboard/assignStudentCourse",
    async ({ studentId, body }: { studentId: string; body: { courseId: string; batchId?: string } }) => {
        await apiPost(API.INTERNAL.STUDENTS.COURSES(studentId), body);
        return await apiGet<StudentAssignment[]>(API.INTERNAL.STUDENTS.COURSES(studentId));
    }
);

export const updateStudentPortalCredentials = createAsyncThunk(
    "dashboard/updateStudentPortalCredentials",
    async ({ studentId, body }: { studentId: string; body: { username: string; email: string; password: string } }) => {
        await apiPatch(`/students/${studentId}/portal-credentials`, body);
        return true;
    }
);

export const uploadStudentsCsv = createAsyncThunk("dashboard/uploadStudentsCsv", async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(API.INTERNAL.STUDENTS.UPLOAD, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data as UploadResult;
});

export const fetchBatchesDashboard = createAsyncThunk("dashboard/fetchBatchesDashboard", async () => {
    const [batches, courses, teachers, students] = await Promise.all([
        apiGet<Batch[]>(API.INTERNAL.BATCHES.ROOT),
        apiGet<Course[]>(API.INTERNAL.COURSES.ROOT),
        apiGet<Teacher[]>(API.INTERNAL.TEACHERS.ROOT),
        apiGet<Student[]>(API.INTERNAL.STUDENTS.ROOT),
    ]);

    return {
        rows: batches ?? [],
        courses: courses ?? [],
        teachers: teachers ?? [],
        students: students ?? [],
    };
});

export const saveBatch = createAsyncThunk(
    "dashboard/saveBatch",
    async ({ editingId, body }: { editingId: string | null; body: Record<string, unknown> }) => {
        if (editingId) {
            await apiPatch(API.INTERNAL.BATCHES.BY_ID(editingId), body);
        } else {
            await apiPost(API.INTERNAL.BATCHES.ROOT, body);
        }
        return true;
    }
);

export const deleteBatch = createAsyncThunk("dashboard/deleteBatch", async (id: string) => {
    await apiDelete(API.INTERNAL.BATCHES.BY_ID(id));
    return id;
});

export const fetchBatchDetails = createAsyncThunk("dashboard/fetchBatchDetails", async (batchId: string) => {
    const notesResponse = await api.get(`${API.INTERNAL.NOTES.ROOT}?batchId=${batchId}&page=1&pageSize=10`);
    const attendanceResponse = await api.get(`${API.INTERNAL.ATTENDANCE.ROOT}?batchId=${batchId}`);
    return {
        notes: notesResponse.data?.data?.items ?? [],
        attendance: attendanceResponse.data?.data ?? [],
    } as { notes: BatchNote[]; attendance: BatchAttendance[] };
});

export const addBatchNote = createAsyncThunk(
    "dashboard/addBatchNote",
    async ({ batchId, courseId, body }: { batchId: string; courseId: string; body: { title: string; description?: string; fileUrl?: string } }) => {
        await apiPost(API.INTERNAL.NOTES.ROOT, { ...body, batchId, courseId });
        const notesResponse = await api.get(`${API.INTERNAL.NOTES.ROOT}?batchId=${batchId}&page=1&pageSize=10`);
        const attendanceResponse = await api.get(`${API.INTERNAL.ATTENDANCE.ROOT}?batchId=${batchId}`);
        return {
            notes: notesResponse.data?.data?.items ?? [],
            attendance: attendanceResponse.data?.data ?? [],
        } as { notes: BatchNote[]; attendance: BatchAttendance[] };
    }
);

export const addBatchAttendance = createAsyncThunk(
    "dashboard/addBatchAttendance",
    async ({ batchId, courseId, body }: { batchId: string; courseId: string; body: { studentId: string; date: string; status: "PRESENT" | "ABSENT" } }) => {
        await apiPost(API.INTERNAL.ATTENDANCE.ROOT, { ...body, batchId, courseId });
        const notesResponse = await api.get(`${API.INTERNAL.NOTES.ROOT}?batchId=${batchId}&page=1&pageSize=10`);
        const attendanceResponse = await api.get(`${API.INTERNAL.ATTENDANCE.ROOT}?batchId=${batchId}`);
        return {
            notes: notesResponse.data?.data?.items ?? [],
            attendance: attendanceResponse.data?.data ?? [],
        } as { notes: BatchNote[]; attendance: BatchAttendance[] };
    }
);

export const fetchFeesDashboard = createAsyncThunk("dashboard/fetchFeesDashboard", async () => {
    const [plans, students] = await Promise.all([
        apiGet<FeePlan[]>(API.INTERNAL.FEES.ROOT),
        apiGet<Student[]>(API.INTERNAL.STUDENTS.ROOT),
    ]);

    return {
        plans: plans ?? [],
        students: students ?? [],
    };
});

export const saveFeePlan = createAsyncThunk("dashboard/saveFeePlan", async (body: Record<string, unknown>) => {
    await apiPost(API.INTERNAL.FEES.ROOT, body);
    return true;
});

export const deleteFeePlan = createAsyncThunk("dashboard/deleteFeePlan", async (planId: string) => {
    await apiDelete(API.INTERNAL.FEES.BY_ID(planId));
    return planId;
});

export const fetchFeePlanPayments = createAsyncThunk("dashboard/fetchFeePlanPayments", async (planId: string) =>
    await apiGet<Payment[]>(API.INTERNAL.FEES.INSTALLMENTS(planId))
);

export const addFeePlanPayment = createAsyncThunk(
    "dashboard/addFeePlanPayment",
    async ({ planId, body }: { planId: string; body: Record<string, unknown> }) => {
        await apiPost(API.INTERNAL.FEES.INSTALLMENTS(planId), body);
        return await apiGet<Payment[]>(API.INTERNAL.FEES.INSTALLMENTS(planId));
    }
);

export const fetchPayments = createAsyncThunk("dashboard/fetchPayments", async (queryString: string) =>
    await apiGet<PaymentRow[]>(`${API.INTERNAL.PAYMENTS.ROOT}${queryString ? `?${queryString}` : ""}`)
);

export const fetchDefaulters = createAsyncThunk("dashboard/fetchDefaulters", async () =>
    await apiGet<Defaulter[]>(API.INTERNAL.DASHBOARD.DEFAULTERS)
);

export const fetchLeads = createAsyncThunk("dashboard/fetchLeads", async (queryString: string) =>
    await apiGet<Lead[]>(`${API.INTERNAL.LEADS.ROOT}${queryString ? `?${queryString}` : ""}`)
);

export const updateLeadStatus = createAsyncThunk(
    "dashboard/updateLeadStatus",
    async ({ leadId, nextStatus }: { leadId: string; nextStatus: string }) => {
        await apiPatch(API.INTERNAL.LEADS.BY_ID(leadId), { status: nextStatus });
        return { leadId, nextStatus };
    }
);

export const fetchLeadTimeline = createAsyncThunk("dashboard/fetchLeadTimeline", async (leadId: string) =>
    await apiGet<LeadActivity[]>(API.INTERNAL.LEADS.TIMELINE(leadId))
);

export const saveLeadDetails = createAsyncThunk(
    "dashboard/saveLeadDetails",
    async ({ leadId, message, followUpAt }: { leadId: string; message: string | null; followUpAt: string | null }) => {
        await apiPatch(API.INTERNAL.LEADS.BY_ID(leadId), { message, followUpAt });
        return true;
    }
);

export const downloadLeadImportTemplate = createAsyncThunk("dashboard/downloadLeadImportTemplate", async (format: "csv" | "xlsx" | "json") => {
    const response = await api.get(`${API.INTERNAL.LEADS.IMPORT}?format=${format}`, { responseType: "blob" });
    return { format, blob: response.data as Blob };
});

export const previewLeadImport = createAsyncThunk("dashboard/previewLeadImport", async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dryRun", "true");
    const response = await api.post(API.INTERNAL.LEADS.IMPORT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data as LeadImportSummary;
});

export const confirmLeadImport = createAsyncThunk("dashboard/confirmLeadImport", async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("dryRun", "false");
    const response = await api.post(API.INTERNAL.LEADS.IMPORT, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data?.data as LeadImportSummary;
});

export const fetchOverview = createAsyncThunk("dashboard/fetchOverview", async () =>
    await apiGet<DashboardOverviewResponse>(API.INTERNAL.DASHBOARD.OVERVIEW)
);

export const postAnnouncement = createAsyncThunk(
    "dashboard/postAnnouncement",
    async ({ title, body }: { title: string; body: string }) => {
        await apiPost("/announcements", { title, body });
        return true;
    }
);

export const fetchInstituteProfile = createAsyncThunk("dashboard/fetchInstituteProfile", async () => {
    const data = await apiGet<any>(API.INTERNAL.INSTITUTE.ROOT);
    return {
        name: data?.name ?? "",
        slug: data?.slug ?? "",
        description: data?.description ?? "",
        phone: data?.phone ?? "",
        whatsapp: data?.whatsapp ?? "",
        addressLine1: data?.address?.addressLine1 ?? "",
        addressLine2: data?.address?.addressLine2 ?? "",
        city: data?.address?.city ?? "",
        state: data?.address?.state ?? "",
        region: data?.address?.region ?? "",
        postalCode: data?.address?.postalCode ?? "",
        country: data?.address?.country ?? "India",
        countryCode: data?.address?.countryCode ?? "",
        timings: data?.timings ?? "",
        logo: data?.logo ?? "",
        heroImage: data?.heroImage ?? data?.banner ?? "",
        banner: data?.banner ?? "",
        googleMapLink: data?.googleMapLink ?? "",
        website: data?.socialLinks?.website ?? "",
        instagram: data?.socialLinks?.instagram ?? "",
        facebook: data?.socialLinks?.facebook ?? "",
        youtube: data?.socialLinks?.youtube ?? "",
        linkedin: data?.socialLinks?.linkedin ?? "",
    } as InstituteProfile;
});

export const saveInstituteProfile = createAsyncThunk("dashboard/saveInstituteProfile", async (form: InstituteProfile) => {
    await api.put(API.INTERNAL.INSTITUTE.ROOT, {
        ...form,
        address: {
            addressLine1: form.addressLine1,
            addressLine2: form.addressLine2,
            city: form.city,
            state: form.state,
            region: form.region,
            postalCode: form.postalCode,
            country: form.country,
            countryCode: form.countryCode,
        },
        banner: form.heroImage ?? form.banner ?? "",
        socialLinks: {
            website: form.website,
            instagram: form.instagram,
            facebook: form.facebook,
            youtube: form.youtube,
            linkedin: form.linkedin,
        },
    });
    return form;
});

export const fetchNotificationSettings = createAsyncThunk("dashboard/fetchNotificationSettings", async () => {
    const response = await api.get<{ success: boolean; data: NotificationPreferences }>(API.INTERNAL.INSTITUTE.NOTIFICATIONS);
    return { ...DEFAULT_PREFS, ...(response.data?.data ?? {}) };
});

export const updateNotificationSetting = createAsyncThunk(
    "dashboard/updateNotificationSetting",
    async ({ key, value }: { key: keyof NotificationPreferences; value: boolean }) => {
        await api.put(API.INTERNAL.INSTITUTE.NOTIFICATIONS, { [key]: value });
        return { key, value };
    }
);

export const fetchWhatsappIntegration = createAsyncThunk("dashboard/fetchWhatsappIntegration", async () => {
    const response = await api.get<{ success: boolean; data: WhatsAppIntegrationState }>(API.INTERNAL.INSTITUTE.WHATSAPP);
    return response.data?.data ?? DEFAULT_WHATSAPP;
});

export const connectWhatsapp = createAsyncThunk("dashboard/connectWhatsapp", async (phoneNumber: string) => {
    const response = await api.post(API.INTERNAL.INSTITUTE.WHATSAPP, { action: "connect", phoneNumber });
    const stateResponse = await api.get<{ success: boolean; data: WhatsAppIntegrationState }>(API.INTERNAL.INSTITUTE.WHATSAPP);
    return {
        data: stateResponse.data?.data ?? DEFAULT_WHATSAPP,
        otpHint: response.data?.data?.otpHint as string | undefined,
    };
});

export const verifyWhatsapp = createAsyncThunk("dashboard/verifyWhatsapp", async (otp: string) => {
    await api.post(API.INTERNAL.INSTITUTE.WHATSAPP, { action: "verify", otp });
    const response = await api.get<{ success: boolean; data: WhatsAppIntegrationState }>(API.INTERNAL.INSTITUTE.WHATSAPP);
    return response.data?.data ?? DEFAULT_WHATSAPP;
});

export const activateWhatsapp = createAsyncThunk(
    "dashboard/activateWhatsapp",
    async ({ phoneNumberId, businessAccountId }: { phoneNumberId: string; businessAccountId: string }) => {
        await api.post(API.INTERNAL.INSTITUTE.WHATSAPP, { action: "activate", phoneNumberId, businessAccountId });
        const response = await api.get<{ success: boolean; data: WhatsAppIntegrationState }>(API.INTERNAL.INSTITUTE.WHATSAPP);
        return response.data?.data ?? DEFAULT_WHATSAPP;
    }
);

export const fetchBillingDashboard = createAsyncThunk("dashboard/fetchBillingDashboard", async () => {
    const response = await api.get<{ success: boolean; data: BillingDashboardPayload }>(API.INTERNAL.BILLING.ROOT);
    return response.data?.data ?? null;
});

export const createBillingSubscription = createAsyncThunk(
    "dashboard/createBillingSubscription",
    async ({ planType, interval, provider, couponCode }: { planType: string; interval: string; provider?: "RAZORPAY" | "STRIPE" | null; couponCode?: string | null }) => {
        const response = await api.post(API.INTERNAL.BILLING.ROOT, {
            action: "create-subscription",
            planType,
            interval,
            provider,
            couponCode,
        });
        return response.data?.data as BillingCheckoutSession;
    }
);

export const confirmBillingSubscription = createAsyncThunk(
    "dashboard/confirmBillingSubscription",
    async (payload: Record<string, unknown>) => {
        const response = await api.post(API.INTERNAL.BILLING.CONFIRM, payload);
        return response.data?.data ?? null;
    }
);

export const generateBillingInvoice = createAsyncThunk("dashboard/generateBillingInvoice", async () => {
    await api.post(API.INTERNAL.BILLING.ROOT, { action: "generate-invoice" });
    return true;
});

export const retryBillingInvoice = createAsyncThunk("dashboard/retryBillingInvoice", async (invoiceId: string) => {
    const response = await api.post(API.INTERNAL.BILLING.ROOT, { action: "retry-invoice", invoiceId });
    return response.data?.data as BillingCheckoutSession;
});

export const fetchIntegrations = createAsyncThunk("dashboard/fetchIntegrations", async () =>
    await apiGet<IntegrationItem[]>(API.INTERNAL.INTEGRATIONS.ROOT)
);

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        clearLeadImportSummary(state) {
            state.leads.import.summary = null;
            state.leads.import.error = null;
        },
        clearStudentUploadResult(state) {
            state.students.upload.result = null;
            state.students.upload.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourses.pending, (state) => {
                state.courses.loading = true;
                state.courses.error = null;
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.courses.loading = false;
                state.courses.data = action.payload ?? [];
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.courses.loading = false;
                state.courses.error = getErrorMessage(action.error);
            })
            .addCase(saveCourse.pending, (state) => {
                state.courses.mutation.loading = true;
                state.courses.mutation.error = null;
            })
            .addCase(saveCourse.fulfilled, (state) => {
                state.courses.mutation.loading = false;
            })
            .addCase(saveCourse.rejected, (state, action) => {
                state.courses.mutation.loading = false;
                state.courses.mutation.error = getErrorMessage(action.error);
            })
            .addCase(deleteCourse.pending, (state) => {
                state.courses.mutation.loading = true;
            })
            .addCase(deleteCourse.fulfilled, (state) => {
                state.courses.mutation.loading = false;
            })
            .addCase(deleteCourse.rejected, (state, action) => {
                state.courses.mutation.loading = false;
                state.courses.mutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchTeachers.pending, (state) => {
                state.teachers.loading = true;
                state.teachers.error = null;
            })
            .addCase(fetchTeachers.fulfilled, (state, action) => {
                state.teachers.loading = false;
                state.teachers.data = action.payload ?? [];
            })
            .addCase(fetchTeachers.rejected, (state, action) => {
                state.teachers.loading = false;
                state.teachers.error = getErrorMessage(action.error);
            })
            .addCase(saveTeacher.pending, (state) => {
                state.teachers.mutation.loading = true;
                state.teachers.mutation.error = null;
            })
            .addCase(saveTeacher.fulfilled, (state) => {
                state.teachers.mutation.loading = false;
            })
            .addCase(saveTeacher.rejected, (state, action) => {
                state.teachers.mutation.loading = false;
                state.teachers.mutation.error = getErrorMessage(action.error);
            })
            .addCase(deleteTeacher.pending, (state) => {
                state.teachers.mutation.loading = true;
            })
            .addCase(deleteTeacher.fulfilled, (state) => {
                state.teachers.mutation.loading = false;
            })
            .addCase(deleteTeacher.rejected, (state, action) => {
                state.teachers.mutation.loading = false;
                state.teachers.mutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchStudentsDashboard.pending, (state) => {
                state.students.loading = true;
                state.students.error = null;
            })
            .addCase(fetchStudentsDashboard.fulfilled, (state, action) => {
                state.students.loading = false;
                state.students.data = action.payload;
            })
            .addCase(fetchStudentsDashboard.rejected, (state, action) => {
                state.students.loading = false;
                state.students.error = getErrorMessage(action.error);
            })
            .addCase(saveStudent.pending, (state) => {
                state.students.mutation.loading = true;
                state.students.mutation.error = null;
            })
            .addCase(saveStudent.fulfilled, (state) => {
                state.students.mutation.loading = false;
            })
            .addCase(saveStudent.rejected, (state, action) => {
                state.students.mutation.loading = false;
                state.students.mutation.error = getErrorMessage(action.error);
            })
            .addCase(deleteStudent.pending, (state) => {
                state.students.mutation.loading = true;
            })
            .addCase(deleteStudent.fulfilled, (state) => {
                state.students.mutation.loading = false;
            })
            .addCase(deleteStudent.rejected, (state, action) => {
                state.students.mutation.loading = false;
                state.students.mutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchStudentAssignments.pending, (state) => {
                state.students.assignments.loading = true;
                state.students.assignments.error = null;
            })
            .addCase(fetchStudentAssignments.fulfilled, (state, action) => {
                state.students.assignments.loading = false;
                state.students.assignments.data = action.payload ?? [];
            })
            .addCase(fetchStudentAssignments.rejected, (state, action) => {
                state.students.assignments.loading = false;
                state.students.assignments.error = getErrorMessage(action.error);
            })
            .addCase(assignStudentCourse.pending, (state) => {
                state.students.assignments.loading = true;
            })
            .addCase(assignStudentCourse.fulfilled, (state, action) => {
                state.students.assignments.loading = false;
                state.students.assignments.data = action.payload ?? [];
            })
            .addCase(assignStudentCourse.rejected, (state, action) => {
                state.students.assignments.loading = false;
                state.students.assignments.error = getErrorMessage(action.error);
            })
            .addCase(updateStudentPortalCredentials.pending, (state) => {
                state.students.mutation.loading = true;
            })
            .addCase(updateStudentPortalCredentials.fulfilled, (state) => {
                state.students.mutation.loading = false;
            })
            .addCase(updateStudentPortalCredentials.rejected, (state, action) => {
                state.students.mutation.loading = false;
                state.students.mutation.error = getErrorMessage(action.error);
            })
            .addCase(uploadStudentsCsv.pending, (state) => {
                state.students.upload.loading = true;
                state.students.upload.error = null;
                state.students.upload.result = null;
            })
            .addCase(uploadStudentsCsv.fulfilled, (state, action) => {
                state.students.upload.loading = false;
                state.students.upload.result = action.payload;
            })
            .addCase(uploadStudentsCsv.rejected, (state, action) => {
                state.students.upload.loading = false;
                state.students.upload.error = getErrorMessage(action.error);
            })
            .addCase(fetchBatchesDashboard.pending, (state) => {
                state.batches.loading = true;
                state.batches.error = null;
            })
            .addCase(fetchBatchesDashboard.fulfilled, (state, action) => {
                state.batches.loading = false;
                state.batches.data = action.payload;
            })
            .addCase(fetchBatchesDashboard.rejected, (state, action) => {
                state.batches.loading = false;
                state.batches.error = getErrorMessage(action.error);
            })
            .addCase(saveBatch.pending, (state) => {
                state.batches.mutation.loading = true;
                state.batches.mutation.error = null;
            })
            .addCase(saveBatch.fulfilled, (state) => {
                state.batches.mutation.loading = false;
            })
            .addCase(saveBatch.rejected, (state, action) => {
                state.batches.mutation.loading = false;
                state.batches.mutation.error = getErrorMessage(action.error);
            })
            .addCase(deleteBatch.pending, (state) => {
                state.batches.mutation.loading = true;
            })
            .addCase(deleteBatch.fulfilled, (state) => {
                state.batches.mutation.loading = false;
            })
            .addCase(deleteBatch.rejected, (state, action) => {
                state.batches.mutation.loading = false;
                state.batches.mutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchBatchDetails.pending, (state) => {
                state.batches.details.loading = true;
                state.batches.details.error = null;
            })
            .addCase(fetchBatchDetails.fulfilled, (state, action) => {
                state.batches.details.loading = false;
                state.batches.details.data = action.payload;
            })
            .addCase(fetchBatchDetails.rejected, (state, action) => {
                state.batches.details.loading = false;
                state.batches.details.error = getErrorMessage(action.error);
            })
            .addCase(addBatchNote.pending, (state) => {
                state.batches.noteMutation.loading = true;
                state.batches.noteMutation.error = null;
            })
            .addCase(addBatchNote.fulfilled, (state, action) => {
                state.batches.noteMutation.loading = false;
                state.batches.details.data = action.payload;
            })
            .addCase(addBatchNote.rejected, (state, action) => {
                state.batches.noteMutation.loading = false;
                state.batches.noteMutation.error = getErrorMessage(action.error);
            })
            .addCase(addBatchAttendance.pending, (state) => {
                state.batches.attendanceMutation.loading = true;
                state.batches.attendanceMutation.error = null;
            })
            .addCase(addBatchAttendance.fulfilled, (state, action) => {
                state.batches.attendanceMutation.loading = false;
                state.batches.details.data = action.payload;
            })
            .addCase(addBatchAttendance.rejected, (state, action) => {
                state.batches.attendanceMutation.loading = false;
                state.batches.attendanceMutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchFeesDashboard.pending, (state) => {
                state.fees.loading = true;
                state.fees.error = null;
            })
            .addCase(fetchFeesDashboard.fulfilled, (state, action) => {
                state.fees.loading = false;
                state.fees.data = action.payload;
            })
            .addCase(fetchFeesDashboard.rejected, (state, action) => {
                state.fees.loading = false;
                state.fees.error = getErrorMessage(action.error);
            })
            .addCase(saveFeePlan.pending, (state) => {
                state.fees.planMutation.loading = true;
                state.fees.planMutation.error = null;
            })
            .addCase(saveFeePlan.fulfilled, (state) => {
                state.fees.planMutation.loading = false;
            })
            .addCase(saveFeePlan.rejected, (state, action) => {
                state.fees.planMutation.loading = false;
                state.fees.planMutation.error = getErrorMessage(action.error);
            })
            .addCase(deleteFeePlan.pending, (state) => {
                state.fees.planMutation.loading = true;
            })
            .addCase(deleteFeePlan.fulfilled, (state) => {
                state.fees.planMutation.loading = false;
            })
            .addCase(deleteFeePlan.rejected, (state, action) => {
                state.fees.planMutation.loading = false;
                state.fees.planMutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchFeePlanPayments.pending, (state) => {
                state.fees.payments.loading = true;
                state.fees.payments.error = null;
            })
            .addCase(fetchFeePlanPayments.fulfilled, (state, action) => {
                state.fees.payments.loading = false;
                state.fees.payments.data = action.payload ?? [];
            })
            .addCase(fetchFeePlanPayments.rejected, (state, action) => {
                state.fees.payments.loading = false;
                state.fees.payments.error = getErrorMessage(action.error);
            })
            .addCase(addFeePlanPayment.pending, (state) => {
                state.fees.paymentMutation.loading = true;
                state.fees.paymentMutation.error = null;
            })
            .addCase(addFeePlanPayment.fulfilled, (state, action) => {
                state.fees.paymentMutation.loading = false;
                state.fees.payments.data = action.payload ?? [];
            })
            .addCase(addFeePlanPayment.rejected, (state, action) => {
                state.fees.paymentMutation.loading = false;
                state.fees.paymentMutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchPayments.pending, (state) => {
                state.payments.loading = true;
                state.payments.error = null;
            })
            .addCase(fetchPayments.fulfilled, (state, action) => {
                state.payments.loading = false;
                state.payments.data = action.payload ?? [];
            })
            .addCase(fetchPayments.rejected, (state, action) => {
                state.payments.loading = false;
                state.payments.error = getErrorMessage(action.error);
            })
            .addCase(fetchDefaulters.pending, (state) => {
                state.defaulters.loading = true;
                state.defaulters.error = null;
            })
            .addCase(fetchDefaulters.fulfilled, (state, action) => {
                state.defaulters.loading = false;
                state.defaulters.data = action.payload ?? [];
            })
            .addCase(fetchDefaulters.rejected, (state, action) => {
                state.defaulters.loading = false;
                state.defaulters.error = getErrorMessage(action.error);
            })
            .addCase(fetchLeads.pending, (state) => {
                state.leads.loading = true;
                state.leads.error = null;
            })
            .addCase(fetchLeads.fulfilled, (state, action) => {
                state.leads.loading = false;
                state.leads.data = action.payload ?? [];
            })
            .addCase(fetchLeads.rejected, (state, action) => {
                state.leads.loading = false;
                state.leads.error = getErrorMessage(action.error);
            })
            .addCase(updateLeadStatus.pending, (state) => {
                state.leads.mutation.loading = true;
                state.leads.mutation.error = null;
            })
            .addCase(updateLeadStatus.fulfilled, (state, action) => {
                state.leads.mutation.loading = false;
                state.leads.data = state.leads.data.map((lead) =>
                    lead.id === action.payload.leadId ? { ...lead, status: action.payload.nextStatus } : lead
                );
            })
            .addCase(updateLeadStatus.rejected, (state, action) => {
                state.leads.mutation.loading = false;
                state.leads.mutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchLeadTimeline.pending, (state) => {
                state.leads.timeline.loading = true;
                state.leads.timeline.error = null;
            })
            .addCase(fetchLeadTimeline.fulfilled, (state, action) => {
                state.leads.timeline.loading = false;
                state.leads.timeline.data = action.payload ?? [];
            })
            .addCase(fetchLeadTimeline.rejected, (state, action) => {
                state.leads.timeline.loading = false;
                state.leads.timeline.error = getErrorMessage(action.error);
            })
            .addCase(saveLeadDetails.pending, (state) => {
                state.leads.mutation.loading = true;
            })
            .addCase(saveLeadDetails.fulfilled, (state) => {
                state.leads.mutation.loading = false;
            })
            .addCase(saveLeadDetails.rejected, (state, action) => {
                state.leads.mutation.loading = false;
                state.leads.mutation.error = getErrorMessage(action.error);
            })
            .addCase(previewLeadImport.pending, (state) => {
                state.leads.import.loading = true;
                state.leads.import.error = null;
            })
            .addCase(previewLeadImport.fulfilled, (state, action) => {
                state.leads.import.loading = false;
                state.leads.import.summary = action.payload;
            })
            .addCase(previewLeadImport.rejected, (state, action) => {
                state.leads.import.loading = false;
                state.leads.import.error = getErrorMessage(action.error);
            })
            .addCase(confirmLeadImport.pending, (state) => {
                state.leads.import.loading = true;
                state.leads.import.error = null;
            })
            .addCase(confirmLeadImport.fulfilled, (state, action) => {
                state.leads.import.loading = false;
                state.leads.import.summary = action.payload;
            })
            .addCase(confirmLeadImport.rejected, (state, action) => {
                state.leads.import.loading = false;
                state.leads.import.error = getErrorMessage(action.error);
            })
            .addCase(fetchOverview.pending, (state) => {
                state.overview.loading = true;
                state.overview.error = null;
            })
            .addCase(fetchOverview.fulfilled, (state, action) => {
                state.overview.loading = false;
                state.overview.data = action.payload;
            })
            .addCase(fetchOverview.rejected, (state, action) => {
                state.overview.loading = false;
                state.overview.error = getErrorMessage(action.error);
            })
            .addCase(postAnnouncement.pending, (state) => {
                state.overview.announcement.loading = true;
            })
            .addCase(postAnnouncement.fulfilled, (state) => {
                state.overview.announcement.loading = false;
            })
            .addCase(postAnnouncement.rejected, (state, action) => {
                state.overview.announcement.loading = false;
                state.overview.announcement.error = getErrorMessage(action.error);
            })
            .addCase(fetchInstituteProfile.pending, (state) => {
                state.profile.loading = true;
                state.profile.error = null;
            })
            .addCase(fetchInstituteProfile.fulfilled, (state, action) => {
                state.profile.loading = false;
                state.profile.data = action.payload;
            })
            .addCase(fetchInstituteProfile.rejected, (state, action) => {
                state.profile.loading = false;
                state.profile.error = getErrorMessage(action.error);
            })
            .addCase(saveInstituteProfile.pending, (state) => {
                state.profile.mutation.loading = true;
                state.profile.mutation.error = null;
            })
            .addCase(saveInstituteProfile.fulfilled, (state, action) => {
                state.profile.mutation.loading = false;
                state.profile.data = action.payload;
            })
            .addCase(saveInstituteProfile.rejected, (state, action) => {
                state.profile.mutation.loading = false;
                state.profile.mutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchNotificationSettings.pending, (state) => {
                state.notifications.loading = true;
                state.notifications.error = null;
            })
            .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
                state.notifications.loading = false;
                state.notifications.data = action.payload;
            })
            .addCase(fetchNotificationSettings.rejected, (state, action) => {
                state.notifications.loading = false;
                state.notifications.error = getErrorMessage(action.error);
            })
            .addCase(updateNotificationSetting.pending, (state) => {
                state.notifications.mutation.loading = true;
                state.notifications.mutation.error = null;
            })
            .addCase(updateNotificationSetting.fulfilled, (state, action) => {
                state.notifications.mutation.loading = false;
                state.notifications.data = { ...state.notifications.data, [action.payload.key]: action.payload.value };
            })
            .addCase(updateNotificationSetting.rejected, (state, action) => {
                state.notifications.mutation.loading = false;
                state.notifications.mutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchWhatsappIntegration.pending, (state) => {
                state.whatsapp.loading = true;
                state.whatsapp.error = null;
            })
            .addCase(fetchWhatsappIntegration.fulfilled, (state, action) => {
                state.whatsapp.loading = false;
                state.whatsapp.data = action.payload;
            })
            .addCase(fetchWhatsappIntegration.rejected, (state, action) => {
                state.whatsapp.loading = false;
                state.whatsapp.error = getErrorMessage(action.error);
            })
            .addCase(connectWhatsapp.pending, (state) => {
                state.whatsapp.mutation.loading = true;
                state.whatsapp.mutation.error = null;
            })
            .addCase(connectWhatsapp.fulfilled, (state, action) => {
                state.whatsapp.mutation.loading = false;
                state.whatsapp.data = action.payload.data;
            })
            .addCase(connectWhatsapp.rejected, (state, action) => {
                state.whatsapp.mutation.loading = false;
                state.whatsapp.mutation.error = getErrorMessage(action.error);
            })
            .addCase(verifyWhatsapp.pending, (state) => {
                state.whatsapp.mutation.loading = true;
                state.whatsapp.mutation.error = null;
            })
            .addCase(verifyWhatsapp.fulfilled, (state, action) => {
                state.whatsapp.mutation.loading = false;
                state.whatsapp.data = action.payload;
            })
            .addCase(verifyWhatsapp.rejected, (state, action) => {
                state.whatsapp.mutation.loading = false;
                state.whatsapp.mutation.error = getErrorMessage(action.error);
            })
            .addCase(activateWhatsapp.pending, (state) => {
                state.whatsapp.mutation.loading = true;
                state.whatsapp.mutation.error = null;
            })
            .addCase(activateWhatsapp.fulfilled, (state, action) => {
                state.whatsapp.mutation.loading = false;
                state.whatsapp.data = action.payload;
            })
            .addCase(activateWhatsapp.rejected, (state, action) => {
                state.whatsapp.mutation.loading = false;
                state.whatsapp.mutation.error = getErrorMessage(action.error);
            })
            .addCase(fetchBillingDashboard.pending, (state) => {
                state.billing.loading = true;
                state.billing.error = null;
            })
            .addCase(fetchBillingDashboard.fulfilled, (state, action) => {
                state.billing.loading = false;
                state.billing.data = action.payload;
            })
            .addCase(fetchBillingDashboard.rejected, (state, action) => {
                state.billing.loading = false;
                state.billing.error = getErrorMessage(action.error);
            })
            .addCase(createBillingSubscription.pending, (state) => {
                state.billing.subscription.loading = true;
                state.billing.subscription.error = null;
                state.billing.subscription.checkout = null;
            })
            .addCase(createBillingSubscription.fulfilled, (state, action) => {
                state.billing.subscription.loading = false;
                state.billing.subscription.checkout = action.payload;
            })
            .addCase(createBillingSubscription.rejected, (state, action) => {
                state.billing.subscription.loading = false;
                state.billing.subscription.error = getErrorMessage(action.error);
            })
            .addCase(confirmBillingSubscription.pending, (state) => {
                state.billing.confirm.loading = true;
                state.billing.confirm.error = null;
            })
            .addCase(confirmBillingSubscription.fulfilled, (state) => {
                state.billing.confirm.loading = false;
            })
            .addCase(confirmBillingSubscription.rejected, (state, action) => {
                state.billing.confirm.loading = false;
                state.billing.confirm.error = getErrorMessage(action.error);
            })
            .addCase(generateBillingInvoice.pending, (state) => {
                state.billing.invoice.loading = true;
                state.billing.invoice.error = null;
            })
            .addCase(generateBillingInvoice.fulfilled, (state) => {
                state.billing.invoice.loading = false;
            })
            .addCase(generateBillingInvoice.rejected, (state, action) => {
                state.billing.invoice.loading = false;
                state.billing.invoice.error = getErrorMessage(action.error);
            })
            .addCase(retryBillingInvoice.pending, (state, action) => {
                state.billing.retry.loading = true;
                state.billing.retry.error = null;
                state.billing.retry.invoiceId = action.meta.arg;
            })
            .addCase(retryBillingInvoice.fulfilled, (state) => {
                state.billing.retry.loading = false;
                state.billing.retry.invoiceId = null;
            })
            .addCase(retryBillingInvoice.rejected, (state, action) => {
                state.billing.retry.loading = false;
                state.billing.retry.invoiceId = null;
                state.billing.retry.error = getErrorMessage(action.error);
            })
            .addCase(fetchIntegrations.pending, (state) => {
                state.integrations.loading = true;
                state.integrations.error = null;
            })
            .addCase(fetchIntegrations.fulfilled, (state, action) => {
                state.integrations.loading = false;
                state.integrations.data = action.payload ?? [];
            })
            .addCase(fetchIntegrations.rejected, (state, action) => {
                state.integrations.loading = false;
                state.integrations.error = getErrorMessage(action.error);
            });
    },
});

export const { clearLeadImportSummary, clearStudentUploadResult } = dashboardSlice.actions;
export default dashboardSlice.reducer;
