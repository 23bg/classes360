import { QueryClient } from "@tanstack/react-query";

export const createQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                cacheTime: 30 * 60 * 1000,
                refetchOnWindowFocus: false,
                retry: 1,
            },
            mutations: {
                retry: false,
            },
        },
    });
