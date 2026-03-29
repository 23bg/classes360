import { API } from "@/constants/api";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/apiService";

export const fetchTeamResources = async () => {
    const [sessionRes, teamsRes, teachersRes] = await Promise.all([
        apiGet<{ user?: { role?: "OWNER" | "MANAGER" | "VIEWER" | null } }>(API.INTERNAL.AUTH.ME),
        apiGet<any[]>(API.INTERNAL.TEAMS.ROOT),
        apiGet<any[]>(API.INTERNAL.TEACHERS.ROOT),
    ]);

    return { sessionRes, teamsRes, teachersRes };
};

export const saveTeacher = async (editingId: string | null, payload: Record<string, unknown>) => {
    if (editingId) {
        await apiPatch(API.INTERNAL.TEACHERS.BY_ID(editingId), payload);
        return;
    }

    await apiPost(API.INTERNAL.TEACHERS.ROOT, payload);
};

export const saveTeamMember = async (editingId: string | null, payload: Record<string, unknown>) => {
    if (editingId) {
        await apiPatch(API.INTERNAL.TEAMS.BY_ID(editingId), payload);
        return;
    }

    await apiPost(API.INTERNAL.TEAMS.ROOT, payload);
};

export const deleteTeacher = async (id: string) => {
    await apiDelete(API.INTERNAL.TEACHERS.BY_ID(id));
};

export const deleteTeamMember = async (id: string) => {
    await apiDelete(API.INTERNAL.TEAMS.BY_ID(id));
};
