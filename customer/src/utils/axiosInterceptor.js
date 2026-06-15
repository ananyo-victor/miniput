import axios from "axios";
import { 
  getCustomerAccessToken, 
  getCustomerRefreshToken, 
  setCustomerTokens, 
  clearCustomerToken 
} from "./customerToken";
import { logoutCustomer } from "../store/authSlice";

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

export const setupCustomerAxiosInterceptors = (dispatch) => {
  if (requestInterceptorId !== null || responseInterceptorId !== null) {
    return;
  }

  requestInterceptorId = axios.interceptors.request.use(
    (config) => {
      const token = getCustomerAccessToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  responseInterceptorId = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (originalRequest.url?.includes('/auth/customer/refresh')) {
          clearCustomerToken();
          if (dispatch) dispatch(logoutCustomer());
          processQueue(error, null);
          isRefreshing = false;
          return Promise.reject(error);
        }

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

        const refreshToken = getCustomerRefreshToken();

        if (!refreshToken) {
          clearCustomerToken();
          if (dispatch) dispatch(logoutCustomer());
          processQueue(new Error("No refresh token"), null);
          return Promise.reject(error);
        }

        try {
          const { data } = await axios.post(`${API_BASE_URL}/api/auth/customer/refresh`, {
            refreshToken
          });

          if (data.success && data.accessToken) {
            setCustomerTokens(data.accessToken, data.refreshToken);
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

            processQueue(null, data.accessToken);
            return axios(originalRequest);
          }
        } catch (refreshError) {
          clearCustomerToken();
          if (dispatch) dispatch(logoutCustomer());
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};