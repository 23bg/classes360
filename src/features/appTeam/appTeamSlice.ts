import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { deleteTeacher, deleteTeamMember as deleteTeamMemberApi, fetchTeamResources, saveTeacher, saveTeamMember as saveTeamMemberApi } from "@/features/appTeam/appTeamApi";
import type { AppTeamState, TeamRow } from "@/features/appTeam/types";

const initialState: AppTeamState = {
    data: [],
    loading: false,
    error: null,
    sessionRole: null,
    mutationLoading: false,
};

const getErrorMessage = (error: unknown) =>
    (error as { message?: string })?.message || "Request failed";

export const fetchTeamData = createAsyncThunk("appTeam/fetchTeamData", async () => {
    const { sessionRes, teamsRes, teachersRes } = await fetchTeamResources();

    const teamRows: TeamRow[] = (teamsRes ?? []).map((member) => ({
        id: member.id,
        name: member.name ?? member.email ?? "Unknown",
        phone: "",
        email: member.email ?? "",
        role: member.role,
        active: true,
        source: "team",
    }));

    const teacherRows: TeamRow[] = (teachersRes ?? []).map((teacher) => ({
        id: teacher.id,
        name: teacher.name,
        phone: "",
        email: "",
        role: "TEACHER",
        active: true,
        subjects: teacher.subject ?? "",
        experience: "",
        bio: teacher.bio ?? "",
        source: "teacher",
    }));

    return {
        rows: [...teamRows, ...teacherRows],
        sessionRole: sessionRes?.user?.role ?? null,
    };
});

export const saveTeamMember = createAsyncThunk(
    "appTeam/saveTeamMember",
    async ({ values, editing }: { values: any; editing: TeamRow | null }) => {
        if (values.role === "TEACHER") {
            const payload = {
                name: values.name,
                subject: values.subjects || undefined,
                bio: values.bio || undefined,
            };

            await saveTeacher(editing?.source === "teacher" ? editing.id : null, payload);
            return true;
        }

        const mappedRole = values.role === "VIEWER" ? "VIEWER" : "MANAGER";
        const payload = editing?.source === "team"
            ? { role: mappedRole }
            : {
                name: values.name,
                email: values.email,
                role: mappedRole,
            };

        await saveTeamMemberApi(editing?.source === "team" ? editing.id : null, payload);
        return true;
    }
);

export const deleteTeamMember = createAsyncThunk("appTeam/deleteTeamMember", async (member: TeamRow) => {
    if (member.source === "teacher") {
        await deleteTeacher(member.id);
        return member.id;
    }

    await deleteTeamMemberApi(member.id);
    return member.id;
});

const appTeamSlice = createSlice({
    name: "appTeam",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTeamData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTeamData.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload.rows;
                state.sessionRole = action.payload.sessionRole;
            })
            .addCase(fetchTeamData.rejected, (state, action) => {
                state.loading = false;
                state.error = getErrorMessage(action.error);
            })
            .addCase(saveTeamMember.pending, (state) => {
                state.mutationLoading = true;
            })
            .addCase(saveTeamMember.fulfilled, (state) => {
                state.mutationLoading = false;
            })
            .addCase(saveTeamMember.rejected, (state, action) => {
                state.mutationLoading = false;
                state.error = getErrorMessage(action.error);
            })
            .addCase(deleteTeamMember.pending, (state) => {
                state.mutationLoading = true;
            })
            .addCase(deleteTeamMember.fulfilled, (state) => {
                state.mutationLoading = false;
            })
            .addCase(deleteTeamMember.rejected, (state, action) => {
                state.mutationLoading = false;
                state.error = getErrorMessage(action.error);
            });
    },
});

export default appTeamSlice.reducer;
