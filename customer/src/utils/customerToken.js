const CUSTOMER_TOKEN_STORAGE_KEY = "customerToken";
const CUSTOMER_ACCESS_TOKEN_KEY = "customerAccessToken";
const CUSTOMER_REFRESH_TOKEN_KEY = "customerRefreshToken";

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(normalized + padding);
};

export const decodeCustomerToken = (token) => {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    return JSON.parse(decodeBase64Url(parts[1]));
  } catch (_error) {
    return null;
  }
};

export const setCustomerTokens = (accessToken, refreshToken) => {
  if (typeof window === "undefined") return;

  if (accessToken) {
    window.localStorage.setItem(CUSTOMER_ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, accessToken);
  }

  if (refreshToken) {
    window.localStorage.setItem(CUSTOMER_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getCustomerAccessToken = () => {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem(CUSTOMER_ACCESS_TOKEN_KEY) ||
    window.localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY)
  );
};

export const getCustomerRefreshToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CUSTOMER_REFRESH_TOKEN_KEY);
};

export const clearCustomerToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CUSTOMER_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
};