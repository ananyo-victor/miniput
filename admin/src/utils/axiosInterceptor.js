import axios from "axios";
import { getAdminAccessToken, getAdminRefreshToken, setAdminTokens, clearAdminToken } from "./adminToken";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
let failedQueue = [];
let requestInterceptorId = null;
let responseInterceptorId = null;

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

export const setupAxiosInterceptors = (dispatch) => {
  if (requestInterceptorId !== null || responseInterceptorId !== null) {
    return;
  }

  // Request Interceptor: Add token to headers
  requestInterceptorId = axios.interceptors.request.use(
    (config) => {
      const token = getAdminAccessToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle 401 and refresh token
  responseInterceptorId = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axios(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = getAdminRefreshToken();

        if (!refreshToken) {
          // No refresh token, need to logout
          clearAdminToken();
          if (dispatch) {
            dispatch({ type: "admin/logout" });
          }
          window.location.href = "/";
          processQueue(new Error("No refresh token"), null);
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/admin/refresh`, {
            refreshToken
          });

          if (data.success && data.accessToken) {
            setAdminTokens(data.accessToken, data.refreshToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            
            // Update Redux state with new tokens
            if (dispatch) {
              dispatch({
                type: "admin/setTokens",
                payload: {
                  accessToken: data.accessToken,
                  refreshToken: data.refreshToken
                }
              });
            }
            
            processQueue(null, data.accessToken);
            return axios(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          clearAdminToken();
          if (dispatch) {
            dispatch({ type: "admin/logout" });
          }
          window.location.href = "/";
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};
