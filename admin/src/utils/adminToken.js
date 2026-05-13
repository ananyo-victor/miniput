const ADMIN_TOKEN_STORAGE_KEY = "adminToken";

const emptyAuthState = {
  token: null,
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

export const getAdminAuthFromStorage = () => {
  if (typeof window === "undefined") {
    return { ...emptyAuthState };
  }

  const token = window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  if (!token) {
    return { ...emptyAuthState };
  }

  const payload = decodeAdminToken(token);
  const role = payload?.role || null;
  const userId = payload?.id || null;

  return {
    token,
    userId,
    role,
    isAdmin: role === "admin"
  };
};

export const clearAdminToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
};

