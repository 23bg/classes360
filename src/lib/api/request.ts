import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import api from "./client";
import { parseApiError } from "./error";
import type { ApiResponse } from "@/types/api";

export type ApiRequestConfig = AxiosRequestConfig;

export async function apiRequest<T>(config: ApiRequestConfig): Promise<T> {
    try {
        const response = await api.request<ApiResponse<T>>(config);
        const payload = response.data;

        if (payload.success) {
            return payload.data as T;
        }

        const message = payload.error?.message ?? `API request failed: ${config.method?.toUpperCase()} ${config.url}`;
        throw { message, code: payload.error?.code };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = error.response?.data?.error?.message ?? error.message;
            throw new Error(parseApiError(message));
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error(parseApiError(error));
    }
}
