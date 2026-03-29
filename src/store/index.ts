import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/slices/authSlice";
import uiReducer from "@/features/ui/uiSlice";
import studentReducer from "@/features/student/studentSlice";
import batchReducer from "@/features/batch/batchSlice";
import courseReducer from "@/features/course/courseSlice";
import appTeamReducer from "@/features/appTeam/appTeamSlice";
import appInstituteReducer from "@/features/appInstitute/appInstituteSlice";
import studentPortalReducer from "@/features/studentPortal/studentPortalSlice";
import dashboardReducer from "@/features/dashboard/dashboardSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        ui: uiReducer,
        student: studentReducer,
        batch: batchReducer,
        course: courseReducer,
        appTeam: appTeamReducer,
        appInstitute: appInstituteReducer,
        studentPortal: studentPortalReducer,
        dashboard: dashboardReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
