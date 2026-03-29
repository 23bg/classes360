import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getStudentPortal, loginStudentPortal, logoutStudentPortal, logoutUser } from "@/features/studentPortal/studentPortalApi";
import type { StudentPortalState } from "@/features/studentPortal/types";

const initialState: StudentPortalState = {
    data: null,
    loading: false,
    error: null,
    authLoading: false,
};

const getErrorMessage = (error: unknown) =>
    (error as { message?: string })?.message || "Request failed";

export const fetchStudentPortal = createAsyncThunk("studentPortal/fetchStudentPortal", async () => {
    return await getStudentPortal();
});

export const studentPortalLogin = createAsyncThunk(
    "studentPortal/studentPortalLogin",
    async (payload: { identifier: string; password: string }) => {
        await loginStudentPortal(payload);
        return true;
    }
);

export const studentPortalLogout = createAsyncThunk("studentPortal/studentPortalLogout", async () => {
    await logoutStudentPortal();
    return true;
});

export const userLogout = createAsyncThunk("studentPortal/userLogout", async () => {
    await logoutUser();
    return true;
});

const studentPortalSlice = createSlice({
    name: "studentPortal",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchStudentPortal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStudentPortal.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchStudentPortal.rejected, (state, action) => {
                state.loading = false;
                state.error = getErrorMessage(action.error);
            })
            .addCase(studentPortalLogin.pending, (state) => {
                state.authLoading = true;
                state.error = null;
            })
            .addCase(studentPortalLogin.fulfilled, (state) => {
                state.authLoading = false;
            })
            .addCase(studentPortalLogin.rejected, (state, action) => {
                state.authLoading = false;
                state.error = getErrorMessage(action.error);
            })
            .addCase(studentPortalLogout.pending, (state) => {
                state.authLoading = true;
            })
            .addCase(studentPortalLogout.fulfilled, (state) => {
                state.authLoading = false;
                state.data = null;
            })
            .addCase(studentPortalLogout.rejected, (state) => {
                state.authLoading = false;
                state.data = null;
            });
    },
});

export default studentPortalSlice.reducer;
