import { redirect } from "next/navigation";
import { readStudentAccessTokenFromCookie } from "@/lib/auth/student-tokens";

export interface ProtectedStudentRouteProps {
    children: React.ReactNode;
}

/**
 * Wrapper component to protect student routes
 * Redirects to /student-login if not authenticated
 */
export async function ProtectedStudentRoute({ children }: ProtectedStudentRouteProps) {
    const session = await readStudentAccessTokenFromCookie();

    if (!session) {
        redirect("/student-login");
    }

    return <>{children}</>;
}
