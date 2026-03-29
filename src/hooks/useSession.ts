import { useGetSession } from '@/features/auth/api';
import type { AuthResponse } from '@/features/auth/types';

export interface UseSessionReturn {
    data: AuthResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => Promise<unknown>;
}

export const useSession = (): UseSessionReturn => {
    const { data, isLoading, isError, error, refetch } = useGetSession(true);

    // If there's an error, treat it as no session
    const sessionData = isError ? undefined : data;

    return {
        data: sessionData,
        isLoading,
        isError,
        error,
        refetch,
    };
};

export const useInvalidateSession = () => {
    // This will be implemented when we add the mutation
    return () => {
        // Invalidate session will be handled by RTK Query invalidation
    };
};

