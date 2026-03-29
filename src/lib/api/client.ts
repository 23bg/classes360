import axios, { AxiosInstance } from 'axios';

const DEFAULT_BASE_URL = '/api/v1';

const resolveBaseURL = (): string => {
    const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (!configured) {
        return DEFAULT_BASE_URL;
    }

    const normalized = configured.replace(/\/+$/, '');

    // In the browser, keep auth/data requests same-origin to avoid CORS/network errors.
    if (typeof window !== 'undefined') {
        if (normalized.startsWith('/')) {
            return normalized;
        }

        try {
            const parsed = new URL(normalized, window.location.origin);
            if (parsed.origin !== window.location.origin) {
                return DEFAULT_BASE_URL;
            }

            return parsed.pathname.replace(/\/+$/, '') || DEFAULT_BASE_URL;
        } catch {
            return DEFAULT_BASE_URL;
        }
    }

    return normalized;
};

const baseURL = resolveBaseURL();

export const api: AxiosInstance = axios.create({
    baseURL,
    withCredentials: true, // Include cookies in requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor: Add auth token if needed (mostly in HttpOnly cookies)
api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: Handle 401 and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried, attempt refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt to refresh the token
                await axios.post(`${baseURL}/auth/refresh`, {}, { withCredentials: true });

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // Redirect to login on refresh failure
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
