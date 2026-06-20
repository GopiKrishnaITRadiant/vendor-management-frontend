const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api";

type AuthHooks = {
  getAccessToken: () => string | null;
  onRefreshed: (accessToken: string, user: any) => void;
  onAuthFailed: () => void;
};

let hooks: AuthHooks | null = null;

export function registerAuthHooks(h: AuthHooks) {
  hooks = h;
}

// ── Single-flight refresh ──────────────────────────────
// Multiple 401s firing at once should trigger ONE refresh call,
// not one per failed request.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      // refreshToken lives in an httpOnly cookie — browser sends it
      // automatically via credentials: 'include'. We don't read or
      // send it from JS at all.
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) throw new Error("refresh failed");

      const data = await res.json(); // { accessToken } — backend also rotates the cookie
      hooks?.onRefreshed(data.accessToken, null); // user not returned by /refresh — keep existing
      return data.accessToken as string;
    } catch {
      hooks?.onAuthFailed();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Core authenticated fetch wrapper ───────────────────
// Attaches access token, auto-retries once on 401 after refresh

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = hooks?.getAccessToken() as string;

  const doFetch = (accessToken: string | null) =>
    fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include", // sends the httpOnly refreshToken cookie automatically
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    });

  let res = await doFetch(token);

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  return res;
}

// ── Auth-specific calls (no access token needed yet) ───

export const authApi = {
  login: (email: string, password: string) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),

  sendOtp: (email: string) =>
    fetch(`${API_BASE}/auth/send-otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),

  verifyFirstLoginOtp: (otpToken: string, otp: string) =>
    fetch(`${API_BASE}/auth/verify-otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpToken, otp }),
    }),

  resendOtp: (otpToken: string) =>
    fetch(`${API_BASE}/auth/resend-otp`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otpToken }),
    }),

  logout: () =>
    apiFetch("/auth/logout", { method: "POST" }),

  refresh: () =>
    fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    }),
};