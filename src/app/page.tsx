import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { readSessionFromCookie } from "@/lib/auth/auth";
import { getRequestHostname, resolveHost } from "@/lib/tenancy/host-routing";
import { instituteService } from "@/features/institute/instituteApi";
import LandingPage from "@/features/marketing/components/LandingPage";
import DashboardHome from "@/features/dashboard/components/DashboardHome";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { DashboardLayoutWithProviders } from "@/providers/DashboardLayoutWithProviders";
import InstitutePublicView from "@/features/institute/components/InstitutePublicView";

// Cache the root page (GitHub style: fast for all users)
export const revalidate = 60; // ISR: revalidate every minute

export default async function Page() {
    const headerStore = await headers();
    const cookieStore = await cookies();
    const hostname = (headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "")
        .split(":")[0]
        .toLowerCase();

    // Determine which surface we're on (marketing, portal, student, or institutePublic)
    const surface = resolveHost(hostname).surface;
    const resolvedHost = resolveHost(hostname);

    // Check if user is authenticated
    const session = await readSessionFromCookie();
    const hasRefreshToken = Boolean(cookieStore.get("refresh_token")?.value);

    // === PORTAL SURFACE (Admin Dashboard) ===
    if (surface === "portal") {
        if (!session) {
            if (hasRefreshToken) {
                redirect("/api/v1/auth/refresh?next=/");
            }
            // Not logged in → show landing page
            return <LandingPage />;
        }

        if (!session.isOnboarded) {
            // Logged in but not onboarded → enforce onboarding
            redirect("/onboarding");
        }

        // Logged in and onboarded → show dashboard
        return (
            <DashboardLayout>
                <DashboardHome />
            </DashboardLayout>
        );
    }

    // === STUDENT SURFACE ===
    if (surface === "student") {
        if (!session) {
            // Not logged in → redirect to student login
            redirect("/student-login");
        }

        // Authenticated → redirect to student portal
        // (Student routing is handled in its own routes)
        redirect("/student");
    }

    // === INSTITUTE PUBLIC SURFACE (Custom Domain) ===
    if (surface === "institutePublic" && resolvedHost.instituteSlug) {
        const institute = await instituteService.getPublicPage(resolvedHost.instituteSlug);
        if (institute) {
            return <InstitutePublicView slug={resolvedHost.instituteSlug} institute={institute} />;
        }
        // Fall back to landing if institute not found
        return <LandingPage />;
    }

    // === MARKETING SURFACE (Main Site - Default) ===
    if (!session) {
        // Guest → show landing page
        return <LandingPage />;
    }

    // Authenticated user on marketing domain → redirect to portal subdomain.
    // In local development the portal host is the same origin, so render the dashboard directly
    // instead of redirecting to the current page and causing a loop.
    const portalDomain = hostname.includes("localhost")
        ? "localhost:3000"
        : `portal.${hostname.replace("www.", "")}`;

    if (hostname.includes("localhost")) {
        if (!session.isOnboarded) {
            redirect("/onboarding");
        }

        return (
            <DashboardLayoutWithProviders showFirstLoginShowcase={false}>
                <DashboardHome />
            </DashboardLayoutWithProviders>
        );
    }

    redirect(`https://${portalDomain}`);
}


