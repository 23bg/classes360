import { useSession } from '@/hooks/useSession';

interface UserRole {
    businessId: string;
    role: "OWNER" | "MANAGER" | "VIEWER" | "EDITOR";

    outletId?: string;
}

export const useRoleAccess = () => {
    const { data: session } = useSession();

    // Get role from session user object
    const role = session?.user?.role;

    // Check if user is OWNER
    const isOwner = role === "OWNER";

    // Check if user is MANAGER
    const isManager = role === "MANAGER";
    const isViewer = role === "VIEWER";

    // For session-based access, we don't have business/outlet IDs
    // These would need to be fetched separately or passed as props
    const assignedOutletId = null;
    const businessId = null;

    // Return a single role object for compatibility
    const roles: UserRole[] = role ? [{ businessId: '', role, outletId: '' }] : [];

    return {
        roles,
        isOwner,
        isManager,
        isViewer,
        assignedOutletId,
        businessId,
        // Helper functions
        canAccessBusinessSettings: isOwner,
        canManageTeam: isOwner,
        canAccessOutlet: (outletId: string) => {
            if (isOwner) return true; // OWNER can access all outlets
            return assignedOutletId === outletId; // MANAGER can only access their outlet
        },
        canManagePosts: (outletId: string) => {
            if (isOwner) return true;
            return assignedOutletId === outletId;
        },
        canManageReviews: (outletId: string) => {
            if (isOwner) return true;
            return assignedOutletId === outletId;
        },
    };
};
