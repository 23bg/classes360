import { API } from "@/constants/api";
import { apiRequest } from "@/lib/api/request";
import type { PortalData } from "@/features/studentPortal/types";

export const getStudentPortal = async () =>
    apiRequest<PortalData>({ url: API.INTERNAL.STUDENT_PORTAL.ME, method: "get" });

export const loginStudentPortal = async (payload: { identifier: string; password: string }) =>
    apiRequest<void>({ url: API.INTERNAL.STUDENT_AUTH.LOGIN, method: "post", data: payload });

export const logoutStudentPortal = async () =>
    apiRequest<void>({ url: API.INTERNAL.STUDENT_AUTH.LOGOUT, method: "post", data: {} });

export const logoutUser = async () =>
    apiRequest<void>({ url: API.AUTH.LOG_OUT, method: "post", data: {} });
