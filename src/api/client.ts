import type { AuthUser } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type AuthHooks = {
  getAccessToken: () => string | null;
  onRefreshed:    (accessToken: string, user: AuthUser) => void;
  onAuthFailed:   () => void;
};

let hooks: AuthHooks | null = null;

export function registerAuthHooks(h: AuthHooks) {
  hooks = h;
}

// ── Single-flight refresh ──────────────────────────────
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method:      "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("refresh failed");

      const json        = await res.json();
      const accessToken = json.data?.accessToken ?? json.accessToken;

      if (!accessToken) throw new Error("access token missing in response");

      hooks?.onRefreshed(accessToken, json.data.user);
      return accessToken as string;
    } catch (err) {
      hooks?.onAuthFailed();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Core fetch wrapper ────────────────────────────────
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = hooks?.getAccessToken() ?? null;

  const doFetch = (t: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
      },
    });

  let res = await doFetch(token);

  // Auto-retry once on 401 after refreshing
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) res = await doFetch(newToken);
  }

  return res;
}

// ── Auth-specific calls ────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method:      "POST",
      credentials: "include",
      headers:     {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }),

  sendOtp: (email: string) =>
    fetch(`${API_BASE}/auth/send-otp`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ email }),
    }),

  verifyOtp: (otpToken: string, otp: string) =>
    fetch(`${API_BASE}/auth/verify-otp`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ otpToken, otp }),
    }),

  resendOtp: (otpToken: string) =>
    fetch(`${API_BASE}/auth/resend-otp`, {
      method:      "POST",
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      body:        JSON.stringify({ otpToken }),
    }),

  logout: () =>
    apiFetch("/auth/logout", { method: "POST" }),

  refresh: () =>
    fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    }),
};