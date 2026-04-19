import { apiRequest } from "@/lib/api/request";
import { API } from "@/constants/api";

export type SearchResults = {
    leads: Array<{ id: string; name: string; phone: string; course?: string | null; status: string }>;
    students: Array<{ id: string; name: string; phone: string; email?: string | null }>;
    courses: Array<{ id: string; name: string; duration?: string | null }>;
};

export const getGlobalSearchResults = async (query: string): Promise<SearchResults> => {
    if (!query || query.trim().length < 2) {
        return { leads: [], students: [], courses: [] };
    }

    return apiRequest<SearchResults>({
        url: `${API.INTERNAL.SEARCH}?q=${encodeURIComponent(query.trim())}`,
        method: "get",
    });
};
