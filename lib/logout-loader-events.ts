/** Dispatched right before Clerk `signOut` so the global loader can show. */
export const VISURA_LOGOUT_LOADER_START = "visura-logout-loader-start";

const STORAGE_KEY = "visura-logout-pending";

export function dispatchLogoutLoaderStart(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode / quota */
  }
  window.dispatchEvent(new Event(VISURA_LOGOUT_LOADER_START));
}

export function clearLogoutLoaderPending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function isLogoutLoaderPending(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
