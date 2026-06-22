import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { registerAuthHooks, authApi, apiFetch } from "../api/client";

// ─── Types ───────────────────────────────────────────────

export type UserRole = "vendor" | "admin" | "manager";

export type AuthUser = {
  id: number;
  fullName: string;
  email: string;
  role: { id: number; name: UserRole };
  isTwoFactorEnabled: boolean;
};

type LoginResult =
  | { requiresOtp: true; otpToken: string; message?: string }
  | { requiresOtp: false; user: AuthUser };

// Single source of truth for "where does this role land after login".
// Must stay in sync with RootRedirect in App.tsx — admin and manager
// both land on /admin (AdminLayout), vendor lands on /purchase-orders
// (the indexed vendor route under VendorLayout).
export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  admin: "/admin",
  manager: "/admin",
  vendor: "/purchase-orders",
};

export function getRoleHomeRoute(role: UserRole | undefined | null): string {
  debugger
  if (!role || !(role in ROLE_HOME_ROUTE)) return "/login";
  return ROLE_HOME_ROUTE[role];
}

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  sendOtp: (email: string) => Promise<{ data:{message: string; otpToken: string} }>;
  verifyOtp: (otpToken: string, otp: string) => Promise<void>;
  resendOtp: (otpToken: string) => Promise<{ message: string; otpToken: string }>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: any }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const tokenRef = useRef<string | null>(null);
  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  const applySession = useCallback((newAccessToken: string, newUser: AuthUser) => {
    setAccessTokenState(newAccessToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(() => {
    setAccessTokenState(null);
    setUser(null);
  }, []);

  // Wire apiFetch's refresh hooks to current React state
  useEffect(() => {
    registerAuthHooks({
      getAccessToken: () => tokenRef.current,
      onRefreshed: (newAccessToken) => {
        // /auth/refresh only returns { accessToken } — user is
        // already in state from the original login, so we keep it.
        setAccessTokenState(newAccessToken);
      },
      onAuthFailed: clearSession,
    });
  }, [clearSession]);

  // On mount: try to mint an access token from the httpOnly
  // refresh cookie. If there's no valid cookie, this 401s and
  // we just land on the login page — no error shown.
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const res = await authApi.refresh();
        if (!res.ok) throw new Error("no valid session");

        const data = await res.json(); // { accessToken }

        // /auth/refresh doesn't return user — fetch it separately
        const meRes = await fetch(
          `${import.meta.env.VITE_API_BASE_URL ?? "/api"}/users/me`,
          {
            headers: { Authorization: `Bearer ${data.accessToken}` },
            credentials: "include",
          },
        );

        if (!meRes.ok) throw new Error("failed to load user");
        const me = await meRes.json();

        if (!cancelled) applySession(data.accessToken, me);
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

  // ── Step 1: email + password ──────────────────────────

  const login = useCallback(
  async (email: string, password: string): Promise<LoginResult> => {
    const res = await authApi.login(email, password);

    const response = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        response.message ?? "Invalid email or password",
      );
    }

    const data = response.data;

    if (!data) {
      throw new Error("Invalid server response");
    }

    // OTP flow
    if (data.requiresOtp) {
      return {
        requiresOtp: true,
        otpToken: data.otpToken,
        message: data.message,
      };
    }

    // Login success
    applySession(data.accessToken, data.user);

    return {
      requiresOtp: false,
      user: data.user,
    };
  },
  [applySession],
);

  // ── Step 2: verify OTP (first login only) ──────────────
  // This step only confirms the OTP is correct — it does NOT
  // establish a session. The session is created afterwards by
  // calling login(email, password) (Step 3 in Login.tsx), since
  // identity has already been confirmed via OTP.

  const verifyOtp = useCallback(
    async (otpToken: string, otp: string): Promise<void> => {
      const res = await authApi.verifyFirstLoginOtp(otpToken, otp);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message ?? "Invalid or expired OTP");
      }

      // No applySession here — confirmation only.
    },
    [],
  );

  const sendOtp = useCallback(async (email: string) => {
    const res = await authApi.sendOtp(email);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message ?? "Could not send OTP");
    }

    return data;
  }, []);

  const resendOtp = useCallback(async (otpToken: string) => {
    const res = await authApi.resendOtp(otpToken);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message ?? "Could not resend OTP");
    }

    return data; // { message, otpToken } — caller must update its local otpToken
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // clear local state regardless of network outcome
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        sendOtp,
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