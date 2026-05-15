import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true, // Crucial for refresh tokens stored as cookies
});

// Request Interceptor: Attach access token
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Handle 401 Unauthorized (Token Expiry)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401, not trying to refresh already, and we have an original request
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh"
    ) {
      originalRequest._retry = true;
      try {
        // Backend handles finding the refresh token from httpOnly cookies automatically via `withCredentials`
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // Update new valid token if it comes back
        if (res.data?.access_token || res.data?.token) {
          const newToken = res.data.access_token || res.data.token;
          if (typeof window !== "undefined") {
            localStorage.setItem("token", newToken);
            useAuthStore
              .getState()
              .login(useAuthStore.getState().user, newToken);
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // If refresh fails, sign out entirely
        if (typeof window !== "undefined") {
          useAuthStore.getState().logout();
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
