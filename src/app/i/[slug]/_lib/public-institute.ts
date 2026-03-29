import { cache } from "react";
import { instituteService } from "@/features/institute/instituteApi";

export const STUDENT_PORTAL_URL = "https://student.classes360.online";

type InstituteCourse = {
    id: string;
    name: string;
    slug?: string | null;
    duration?: string | null;
    defaultFees?: number | null;
    description?: string | null;
};

type InstituteTeacher = {
    id: string;
    name: string;
    subject?: string | null;
    experience?: string | null;
};

type InstituteAnnouncement = {
    title: string;
    body: string;
    createdAt: string;
};

type InstituteBatch = {
    id: string;
    courseId: string;
    name: string;
    schedule?: string | null;
};

type InstitutePublicData = {
    id: string;
    name?: string | null;
    slug?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    description?: string | null;
    heroImage?: string | null;
    banner?: string | null;
    logo?: string | null;
    createdAt?: string | Date;
    address?: {
        addressLine1?: string | null;
        addressLine2?: string | null;
        city?: string | null;
        state?: string | null;
    };
    courses: InstituteCourse[];
    teachers: InstituteTeacher[];
    batches: InstituteBatch[];
    announcements?: InstituteAnnouncement[];
};

export const getPublicInstitute = cache(async (slug: string) => {
    return instituteService.getPublicPage(slug) as Promise<InstitutePublicData>;
});

export const toSlug = (value?: string | null): string =>
    (value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

export const courseRouteSlug = (course: InstituteCourse): string => {
    const raw = course.slug?.trim() || toSlug(course.name);
    return raw || course.id;
};

export const findCourseBySlug = (courses: InstituteCourse[], routeSlug: string): InstituteCourse | undefined => {
    return courses.find((course) => {
        const derived = courseRouteSlug(course);
        return derived === routeSlug || course.id === routeSlug;
    });
};

export const getInstituteAddress = (institute: InstitutePublicData): string => {
    return [
        institute.address?.addressLine1,
        institute.address?.addressLine2,
        institute.address?.city,
        institute.address?.state,
    ]
        .filter(Boolean)
        .join(", ");
};

export const getWhatsAppUrl = (institute: InstitutePublicData): string | null => {
    const whatsappRaw = institute.whatsapp || institute.phone || "";
    const digits = whatsappRaw.replace(/\D/g, "");
    if (!digits) return null;
    const normalized = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${normalized}`;
};

export const formatFees = (fees?: number | null): string => {
    if (fees === undefined || fees === null || Number.isNaN(fees)) return "N/A";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(fees);
};

export const instituteRoute = {
    home: (slug: string) => `/i/${slug}`,
    courses: (slug: string) => `/i/${slug}/courses`,
    course: (slug: string, courseSlug: string) => `/i/${slug}/courses/${courseSlug}`,
    faculty: (slug: string) => `/i/${slug}/faculty`,
    announcements: (slug: string) => `/i/${slug}/announcements`,
    contact: (slug: string) => `/i/${slug}/contact`,
    student: (slug: string) => `/i/${slug}/student`,
};

export type { InstitutePublicData, InstituteCourse, InstituteTeacher, InstituteAnnouncement, InstituteBatch };

