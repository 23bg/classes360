import api from "@/lib/axios";
import { API } from "@/constants/api";

export type SearchResults = {
    leads: Array<{ id: string; name: string; phone: string; course?: string | null; status: string }>;
    students: Array<{ id: string; name: string; phone: string; email?: string | null }>;
    courses: Array<{ id: string; name: string; duration?: string | null }>;
};

export const getGlobalSearchResults = async (query: string) => {
    const response = await api.get(`${API.INTERNAL.SEARCH}?q=${encodeURIComponent(query.trim())}`);
    return (response.data?.data ?? { leads: [], students: [], courses: [] }) as SearchResults;
};
