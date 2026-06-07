const HOME_FALLBACK_SLUG = "miniput";

export const isHomeRoute = (pathname = "") =>
  pathname === "/home" ||
  pathname.startsWith("/home/") ||
  pathname === "/miniput" ||
  pathname === "/kwink";

export const getWorkspaceHomePath = (workspaceSlug) =>
  `/home/${String(workspaceSlug || HOME_FALLBACK_SLUG).trim().toLowerCase() || HOME_FALLBACK_SLUG}`;

export const resolvePathAfterWorkspaceSwitch = (pathname, workspaceSlug) => {
  if (isHomeRoute(pathname)) {
    return getWorkspaceHomePath(workspaceSlug);
  }

  return pathname;
};
