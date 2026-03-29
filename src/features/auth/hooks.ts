import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

/**
 * Custom hook to get current auth user from Redux
 * Use this in components to access current user state
 */
export const useAuth = () => {
    const { user, role } = useSelector((state: RootState) => state.auth);
    const isAuthenticated = !!user;

    return {
        user,
        role,
        isAuthenticated,
    };
};

/**
 * Check if user has specific role
 */
export const useHasRole = (requiredRole: string | string[]) => {
    const { role } = useAuth();
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(role || '');
};
