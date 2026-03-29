import { useEffect, useRef } from "react";

/**
 * Client-side hook for automatic token refresh
 * Refreshes access token 5 minutes before expiry (15m - 10m = 5m)
 *
 * Usage in your root layout or app component:
 * ```tsx
 * export default function RootLayout({ children }) {
 *   useAuthRefresh();
 *   return <>{children}</>;
 * }
 * ```
 */
export function useAuthRefresh() {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Calculate refresh interval (10 minutes)
        // Access tokens expire in 15 minutes, so refresh at 10 minute mark
        const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

        const refreshAccessToken = async () => {
            try {
                const response = await fetch("/api/v1/auth/refresh", {
                    method: "POST",
                    credentials: "include", // Include cookies
                });

                if (!response.ok) {
                    // Token refresh failed - user will need to log in again on next protected route access
                    console.warn("[useAuthRefresh] Token refresh failed", response.status);
                }
            } catch (error) {
                // Network error - don't throw, just log
                console.error("[useAuthRefresh] Error refreshing token:", error);
            }
        };

        // Start refresh interval on component mount
        intervalRef.current = setInterval(refreshAccessToken, REFRESH_INTERVAL);

        // Cleanup on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
}

/**
 * Optional: Student-specific token refresh hook
 * Same logic but for student tokens
 */
export function useStudentAuthRefresh() {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

        const refreshAccessToken = async () => {
            try {
                const response = await fetch("/api/v1/student/refresh", {
                    method: "POST",
                    credentials: "include",
                });

                if (!response.ok) {
                    console.warn("[useStudentAuthRefresh] Token refresh failed", response.status);
                }
            } catch (error) {
                console.error("[useStudentAuthRefresh] Error refreshing token:", error);
            }
        };

        intervalRef.current = setInterval(refreshAccessToken, REFRESH_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);
}
