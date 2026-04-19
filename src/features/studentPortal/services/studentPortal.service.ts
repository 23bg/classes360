import { API } from "@/constants/api";
import { apiRequest } from "@/lib/api/request";
import type { PortalData } from "@/features/studentPortal/types";

export const studentPortalService = {
    getStudentPortal: async (): Promise<PortalData> =>
        apiRequest<PortalData>({ url: API.INTERNAL.STUDENT_PORTAL.ME, method: "get" }),

    loginStudentPortal: async (payload: { identifier: string; password: string }) =>
        apiRequest<void>({ url: API.INTERNAL.STUDENT_AUTH.LOGIN, method: "post", data: payload }),

    logoutStudentPortal: async () =>
        apiRequest<void>({ url: API.INTERNAL.STUDENT_AUTH.LOGOUT, method: "post", data: {} }),

    logoutUser: async () =>
        apiRequest<void>({ url: API.AUTH.LOG_OUT, method: "post", data: {} }),
};
