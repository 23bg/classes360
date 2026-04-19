import { useQuery } from "@tanstack/react-query";
import { getGlobalSearchResults, type SearchResults } from "@/features/globalSearch/globalSearchApi";

export const useGlobalSearchQuery = (query: string, enabled: boolean) =>
    useQuery<SearchResults, Error, SearchResults>({
        queryKey: ["globalSearch", query],
        queryFn: () => getGlobalSearchResults(query),
        enabled,
        staleTime: 2 * 60 * 1000,
        retry: false,
    });
