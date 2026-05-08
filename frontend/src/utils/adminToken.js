const ADMIN_ACCESS_TOKEN_KEY = "adminAccessToken";
const ADMIN_REFRESH_TOKEN_KEY = "adminRefreshToken";
const ADMIN_TOKEN_STORAGE_KEY = "adminToken"; // backward compatibility

const emptyAuthState = {
  token: null,
  accessToken: null,
  refreshToken: null,
  userId: null,
  role: null,
  isAdmin: false
};

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return atob(normalized + padding);
};

export const decodeAdminToken = (token) => {
  if (!token || typeof token !== "string") {
    return null;
  }

  try {
    const parts = token.split(".");
    if (parts.length < 2) {
      return null;
    }

    const payload = decodeBase64Url(parts[1]);
    return JSON.parse(payload);
  } catch (_error) {
    return null;
  }
};

export const setAdminTokens = (accessToken, refreshToken) => {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, accessToken); // backward compatibility
  }
  if (refreshToken) {
    window.localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getAdminAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
};

export const getAdminRefreshToken = () => {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
};

export const getAdminAuthFromStorage = () => {
  if (typeof window === "undefined") {
    return { ...emptyAuthState };
  }

  const accessToken = window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
  const refreshToken = window.localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
  
  if (!accessToken) {
    return { ...emptyAuthState };
  }

  const payload = decodeAdminToken(accessToken);
  const role = payload?.role || null;
  const userId = payload?.id || null;

  return {
    token: accessToken, // backward compatibility
    accessToken,
    refreshToken,
    userId,
    role,
    isAdmin: role === "admin"
  };
};

export const clearAdminToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
};

