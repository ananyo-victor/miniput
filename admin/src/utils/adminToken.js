const ADMIN_TOKEN_STORAGE_KEY = "adminToken";
const ADMIN_ACCESS_TOKEN_KEY = "adminAccessToken";
const ADMIN_REFRESH_TOKEN_KEY = "adminRefreshToken";

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

const hasAdminRole = (roleValue) => {
  if (Array.isArray(roleValue)) {
    return roleValue.some((item) => String(item || "").trim().toLowerCase() === "admin");
  }

  const roleText = String(roleValue || "").toLowerCase();
  const roleParts = roleText.split(/[\s,|:_-]+/).map((item) => item.trim()).filter(Boolean);
  return roleParts.includes("admin");
};

export const setAdminTokens = (accessToken, refreshToken) => {
  if (typeof window === "undefined") {
    return;
  }

  if (accessToken) {
    window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, accessToken);
  }

  if (refreshToken) {
    window.localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const getAdminAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) ||
    window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)
  );
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

  const accessToken = getAdminAccessToken();
  const refreshToken = getAdminRefreshToken();

  if (!accessToken) {
    return { ...emptyAuthState };
  }

  const payload = decodeAdminToken(accessToken);
  const role = payload?.role || null;
  const userId = payload?.id || null;

  return {
    token: accessToken,
    accessToken,
    refreshToken,
    userId,
    role,
    isAdmin: hasAdminRole(role)
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
