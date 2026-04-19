import { redirect } from "next/navigation";
import { readStudentSessionFromCookie } from "@/lib/auth/student-auth";
import type { Metadata } from "next";
import StudentPortalHeader from "@/components/student/StudentPortalHeader";
import StudentPortalFooter from "@/components/student/StudentPortalFooter";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
    const session = await readStudentSessionFromCookie();
    if (!session) {
        redirect("/student-login");
    }

    return (
        <div className="min-h-screen bg-muted/20">
            <StudentPortalHeader />
            <main className="mx-auto max-w-6xl p-4 md:p-6">{children}</main>
            <StudentPortalFooter />
        </div>
    );
}
