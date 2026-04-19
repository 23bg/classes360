import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API } from "@/constants/api";

const api = axios.create({
    baseURL: API.BASE_V1,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    timeout: 10000,
});

interface RetryableAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let isRefreshing = false;
let refreshQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processRefreshQueue = (error: Error | null) => {
    refreshQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(undefined);
        }
    });
    refreshQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

        if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    refreshQueue.push({ resolve, reject });
                })
                    .then(() => api(originalRequest))
                    .catch((refreshError) => Promise.reject(refreshError));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await api.post(API.AUTH.REFRESH_TOKEN, {});
                processRefreshQueue(null);
                return api(originalRequest);
            } catch (refreshError) {
                processRefreshQueue(refreshError as Error);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
