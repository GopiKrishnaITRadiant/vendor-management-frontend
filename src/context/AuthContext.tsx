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
  id: number;
  fullName: string;
  email: string;
  role: { id: number; name: UserRole };
  isTwoFactorEnabled: boolean;
  sapVendorId: string | null;
};

// Discriminated union — the shape of what login() resolves to.
// requiresOtp: true  → password confirmed, 2FA challenge issued, no session yet.
// requiresOtp: false → full login complete, session is live.
type LoginResult =
  | { requiresOtp: true; otpToken: string; message?: string }
  | { requiresOtp: false; user: AuthUser };

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  admin: "/admin",
  manager: "/admin",
  vendor: "/vendor-dashboard",
};

export function getRoleHomeRoute(role?: UserRole | null): string {
  if (!role || !(role in ROLE_HOME_ROUTE)) return "/login";
  return ROLE_HOME_ROUTE[role];
}

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verifyOtp: (
    otpToken: string,
    otp: string,
  ) => Promise<{ accessToken: string; user: AuthUser }>;
  resendOtp: (
    otpToken: string,
  ) => Promise<{ message: string; otpToken: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─────────────────────────────────────────────────────────
// SECURITY MODEL
//
// Access token  → JS memory only (useRef — not even React state)
//                 Lost on refresh — intentional
//
// User object   → derived from the login/verifyOtp/refresh response body
//                 Never stored anywhere — re-derived on each silent refresh
//                 No sessionStorage, no localStorage
//
// Refresh token → httpOnly cookie
//                 Browser sends it automatically on /auth/refresh
//                 JS cannot read it — XSS-safe
//
// On page reload:
//   1. Access token is gone (ref cleared, memory wiped)
//   2. /auth/refresh is called — browser sends httpOnly cookie automatically
//   3. Server returns new { accessToken, user } in response body
//   4. User is re-hydrated from the response — no storage read at all
// ─────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Access token lives here only — NOT in React state.
  // Components never read it directly; apiFetch() does via the registered hook.
  const tokenRef = useRef<string | null>(null);

  const applySession = useCallback((token: string, u: AuthUser) => {
    tokenRef.current = token;
    setUser(u);
  }, []);

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    setUser(null);
  }, []);

  // Wire apiFetch to this ref so all API calls attach the right token.
  useEffect(() => {
    registerAuthHooks({
      getAccessToken: () => tokenRef.current,

      onRefreshed: (newToken: string, newUser: AuthUser | null) => {
        tokenRef.current = newToken;
        if (newUser) setUser(newUser);
      },

      onAuthFailed: clearSession,
    });
  }, [clearSession]);

  // ── Silent refresh on mount ───────────────────────────
  // Restores the session after a page reload using the httpOnly refresh
  // cookie. The server returns both accessToken and user so we never
  // need a separate /users/me call.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const res = await authApi.refresh();
        if (!res.ok) throw new Error("no session");

        const json = await res.json();
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
    return () => {
      cancelled = true;
    };
  }, [applySession, clearSession]);

  // ── Login (Step 1 of Option B) ────────────────────────
  // Validates email + password against the backend.
  //
  // Two possible outcomes the backend can return:
  //   A) { requiresOtp: true, otpToken, message }
  //      → Password was correct. Account has 2FA enabled.
  //        No session issued yet. Client must complete verifyOtp().
  //
  //   B) { accessToken, user }
  //      → Password correct, no 2FA. Login is complete; session applied now.
  //
  // We check data.requiresOtp (the backend flag) — NOT data.user.isTwoFactorEnabled.
  // When requiresOtp is true the backend returns no user object at all,
  // so reading data.user would throw.
  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const res = await authApi.login(email, password);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json.message ?? "Invalid email or password");

      const data = json.data ?? json;

      if (data.requiresOtp) {
        // 2FA path — return the challenge data only.
        // applySession is NOT called; no token, no user yet.
        return {
          requiresOtp: true,
          otpToken: data.otpToken,
          message: data.message,
        };
      }

      // Non-2FA path — login is complete.
      applySession(data.accessToken, data.user);
      return { requiresOtp: false, user: data.user };
    },
    [applySession],
  );

  // ── Verify OTP (Step 2 of Option B, only for 2FA accounts) ───
  // Called with the otpToken received from login() and the code
  // the user entered. On success the backend issues the full session
  // (accessToken + refreshToken cookie) — identical to the non-2FA
  // login path above.
  const verifyOtp = useCallback(
    async (otpToken: string, otp: string) => {
      const res = await authApi.verifyOtp(otpToken, otp);
      const json = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(json.message ?? "Invalid or expired OTP");

      const data = json.data ?? json;

      // OTP confirmed — both factors passed. Apply the session now.
      applySession(data.accessToken, data.user);
      return data as { accessToken: string; user: AuthUser };
    },
    [applySession],
  );

  // ── Resend OTP ────────────────────────────────────────
  // Exchanges the current otpToken for a freshly generated one
  // (the old token is burned server-side after resend).
  // Returns the new otpToken so the Login component can replace its local state.
  const resendOtp = useCallback(async (otpToken: string) => {
    const res = await authApi.resendOtp(otpToken);
    const json = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(json.message ?? "Could not resend OTP");

    const data = json.data ?? json;
    return data as { message: string; otpToken: string };
  }, []);

  // ── Logout ────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* always clear regardless */
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!tokenRef.current,
        login,
        verifyOtp,
        resendOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
