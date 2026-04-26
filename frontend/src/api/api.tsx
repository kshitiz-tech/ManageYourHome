import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constant";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Django API base URL
});

console.log(import.meta.env.VITE_API_URL);

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const isAuthEndpoint =
      originalRequest.url?.includes("/api/token/") ||
      originalRequest.url?.includes("/api/token/refresh/");
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshToken) {
      return Promise.reject(error);
    }

    try {
      const refreshResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/token/refresh/`,
        { refresh: refreshToken }
      );

      const newAccess = refreshResponse.data?.access;
      if (!newAccess) {
        return Promise.reject(error);
      }

      localStorage.setItem(ACCESS_TOKEN, newAccess);
      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;

      return api(originalRequest);
    } catch (refreshError) {
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      return Promise.reject(refreshError);
    }
  }
);

export default api;
