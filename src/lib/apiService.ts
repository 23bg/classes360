import axios from "axios";
import api from "./axios";
import { ApiResponse } from "../types/api";
import { AppError } from "@/lib/utils/error";

async function apiService<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  payload: unknown = null
): Promise<T> {
  try {
    const response = await api[method]<ApiResponse<T>>(url, ...[payload].filter(Boolean));
    const apiResponse = response.data;

    if (apiResponse.success && apiResponse.data !== null && apiResponse.data !== undefined) {
      return apiResponse.data;
    }

    const fallbackMessage = `API error: ${method.toUpperCase()} to ${url} failed.`;
    const message = apiResponse.error?.message || fallbackMessage;
    throw new AppError(message, 400, "API_RESPONSE_ERROR", apiResponse.error);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const backendError = error.response?.data?.error;
      if (backendError?.message) {
        throw new AppError(
          backendError.message,
          error.response?.status ?? 500,
          backendError.code ?? "NETWORK_ERROR",
          backendError
        );
      }
      throw new AppError(
        error.message || "An unknown network error occurred.",
        error.response?.status ?? 500,
        "NETWORK_ERROR",
        error.response?.data
      );
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new AppError("Unexpected API service error.", 500, "UNEXPECTED_ERROR", error);
  }
}

export const apiGet = <T>(url: string) => apiService<T>("get", url);
export const apiPost = <T>(url:string, data: unknown) => apiService<T>("post", url, data);
export const apiPut = <T>(url:string, data: unknown) => apiService<T>("put", url, data);
export const apiPatch = <T>(url:string, data: unknown) => apiService<T>("patch", url, data);
export const apiDelete = <T>(url:string) => apiService<T>("delete", url);


