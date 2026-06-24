import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { registerAuthHooks, authApi } from "../api/client";

export type UserRole = "vendor" | "admin" | "manager";

export type AuthUser = {
  id:                 number;
  fullName:           string;
  email:              string;
  role:               { id: number; name: UserRole };
  isTwoFactorEnabled: boolean;
  sapVendorId:        string | null;
};

type LoginResult =
  | { requiresOtp: true;  otpToken: string; message?: string }
  | { requiresOtp: false; user: AuthUser };

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  admin:   "/admin",
  manager: "/admin",
  vendor:  "/vendor-dashboard",
};

export function getRoleHomeRoute(role?: UserRole | null): string {
  if (!role || !(role in ROLE_HOME_ROUTE)) return "/login";
  return ROLE_HOME_ROUTE[role];
}

type AuthContextType = {
  user:            AuthUser | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  login:     (email: string, password: string) => Promise<LoginResult>;
  sendOtp:   (email: string) => Promise<{ message: string; otpToken: string; expiresIn: number }>;
  verifyOtp: (otpToken: string, otp: string) => Promise<{ accessToken: string; user: AuthUser }>;
  resendOtp: (otpToken: string) => Promise<{ message: string; otpToken: string }>;
  logout:    () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────
// SECURITY MODEL
//
// Access token  → JS memory only (useRef — not even React state)
//                 Lost on refresh — intentional
//
// User object   → decoded from access token payload
//                 Never stored anywhere — re-derived after each
//                 silent refresh from the token itself
//                 No sessionStorage, no localStorage
//
// Refresh token → httpOnly cookie
//                 Browser sends it automatically
//                 JS cannot read it — XSS-safe
//
// On page refresh:
//   1. Access token is gone (memory cleared)
//   2. /auth/refresh is called — browser sends httpOnly cookie
//   3. Server returns new { accessToken, user } in response body
//   4. User is re-hydrated from the response — no storage read
//
// Why not sessionStorage for user?
//   sessionStorage is readable by any JS on the page.
//   XSS can read it. The user object contains id, email,
//   role, sapVendorId — useful for targeted attacks even
//   without the token. Keep it out of any storage.
// ─────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: any }) {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Access token in a ref — NOT React state.
  // We don't want token changes to trigger re-renders.
  // Components never read the token directly — they use
  // apiFetch() which reads from this ref via the hook.
  const tokenRef         = useRef<string | null>(null);
  const bootstrappedRef  = useRef(false);

  const applySession = useCallback((token: string, u: AuthUser) => {
    tokenRef.current = token;
    setUser(u);
  }, []);

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    setUser(null);
  }, []);

  // Wire apiFetch to this ref
  useEffect(() => {
    registerAuthHooks({
      getAccessToken: () => tokenRef.current,

      onRefreshed: (newToken: string, newUser: AuthUser | null) => {
        tokenRef.current = newToken;
        // If server also returns updated user on refresh, apply it
        if (newUser) setUser(newUser);
      },

      onAuthFailed: clearSession,
    });
  }, [clearSession]);

  // ── Silent refresh on mount ───────────────────────────
  // The refresh endpoint returns BOTH accessToken AND user
  // so we never need a separate /users/me call

  useEffect(() => {
    // if (bootstrappedRef.current) return;
    // bootstrappedRef.current = true;

    let cancelled = false;

    async function bootstrap() {
      try {
        const res = await authApi.refresh();

        if (!res.ok) throw new Error("no session");

        const json    = await res.json();
        // Handle both { data: { accessToken, user } } and { accessToken, user }
        const payload = json.data ?? json;

        if (!payload.accessToken) throw new Error("no token");

        if (!cancelled) applySession(payload.accessToken, payload.user);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, [applySession, clearSession]);

  // ── Login ─────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const res  = await authApi.login(email, password);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json.message ?? "Invalid email or password");

      const data = json.data ?? json;

      if (data.requiresOtp) {
        return { requiresOtp: true, otpToken: data.otpToken, message: data.message };
      }

      applySession(data.accessToken, data.user);
      return { requiresOtp: false, user: data.user };
    },
    [applySession],
  );

  // ── Send OTP ──────────────────────────────────────────

  const sendOtp = useCallback(async (email: string) => {
    const res  = await authApi.sendOtp(email);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message ?? "Could not send OTP");
    const data = json.data ?? json;
    return data as { message: string; otpToken: string; expiresIn: number };
  }, []);

  // ── Verify OTP ────────────────────────────────────────

  const verifyOtp = useCallback(
    async (otpToken: string, otp: string) => {
      const res  = await authApi.verifyOtp(otpToken, otp);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message ?? "Invalid or expired OTP");
      const data = json.data ?? json;
      applySession(data.accessToken, data.user);
      return data as { accessToken: string; user: AuthUser };
    },
    [applySession],
  );

  // ── Resend OTP ────────────────────────────────────────

  const resendOtp = useCallback(async (otpToken: string) => {
    const res  = await authApi.resendOtp(otpToken);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message ?? "Could not resend OTP");
    const data = json.data ?? json;
    return data as { message: string; otpToken: string };
  }, []);

  // ── Logout ────────────────────────────────────────────

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* always clear */ }
    finally { clearSession(); }
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user && !!tokenRef.current,
      login,
      sendOtp,
      verifyOtp,
      resendOtp,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}