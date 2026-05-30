import axios from "axios";
import { getAdminAccessToken, getAdminRefreshToken, setAdminTokens, clearAdminToken } from "./adminToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  isRefreshing = false;
  failedQueue = [];
};

export const setupAxiosInterceptors = () => {
  // Request Interceptor: Add token to headers
  axios.interceptors.request.use(
    (config) => {
      const token = getAdminAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle 401 and refresh token
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      const isUnauthorized = error.response?.status === 401;
      const hasAdminContext = Boolean(getAdminAccessToken());

      if (isUnauthorized && !originalRequest._retry && hasAdminContext) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getAdminRefreshToken();

        if (!refreshToken) {
          clearAdminToken();
          processQueue(new Error("No refresh token"), null);
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/admin/refresh`, {
            refreshToken
          });

          if (data.success && data.accessToken) {
            setAdminTokens(data.accessToken, data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

            processQueue(null, data.accessToken);
            return axios(originalRequest);
          }
        } catch (refreshError) {
          clearAdminToken();
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
