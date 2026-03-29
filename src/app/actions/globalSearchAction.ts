"use server";

import { getGlobalSearchResults } from "@/features/globalSearch/globalSearchApi";

export async function searchGlobal(query: string) {
    if (!query || typeof query !== "string") return { leads: [], students: [], courses: [] };
    const trimmed = query.trim();
    if (trimmed.length < 2) return { leads: [], students: [], courses: [] };
    // Delegate to existing service which uses axios; run on server
    const results = await getGlobalSearchResults(trimmed);
    return results;
}
