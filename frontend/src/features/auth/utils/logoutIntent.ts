const LOGOUT_INTENT_KEY = "golladrim:logout-intent";

export function markLogoutIntent() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOGOUT_INTENT_KEY, "true");
}

export function clearLogoutIntent() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LOGOUT_INTENT_KEY);
}

export function hasLogoutIntent() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(LOGOUT_INTENT_KEY) === "true";
}
