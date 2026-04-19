import { useCurrentUser } from '@/features/auth/api';
import type { AuthResponse } from '@/features/auth/types';

export interface UseSessionReturn {
    data: AuthResponse | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => Promise<unknown>;
}

export const useSession = (): UseSessionReturn => {
    const { data, isLoading, isError, error, refetch } = useCurrentUser();

    return {
        data: isError ? undefined : data,
        isLoading,
        isError,
        error,
        refetch,
    };
};

export const useInvalidateSession = () => {
    return () => {
        // React Query manages auth cache invalidation.
    };
};

