import { API } from "@/constants/api";
import { apiGet, apiPost } from "@/lib/apiService";
import type { PortalData } from "@/features/studentPortal/types";

export const getStudentPortal = async () => {
    return await apiGet<PortalData>(API.INTERNAL.STUDENT_PORTAL.ME);
};

export const loginStudentPortal = async (payload: { identifier: string; password: string }) => {
    await apiPost(API.INTERNAL.STUDENT_AUTH.LOGIN, payload);
};

export const logoutStudentPortal = async () => {
    await apiPost(API.INTERNAL.STUDENT_AUTH.LOGOUT, {});
};

export const logoutUser = async () => {
    await apiPost(API.AUTH.LOG_OUT, {});
};
