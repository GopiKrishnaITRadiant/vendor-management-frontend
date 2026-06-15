import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

// ─── Types ───────────────────────────────────────────────

export type UserRole = "vendor" | "admin";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  vendorCode?: string; // only for vendors
  avatar?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
};

// ─── Context ─────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── JWT Decode (lightweight, no library needed) ─────────

function decodeJWT(token: string): AuthUser | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload));

    // Expected JWT payload shape:
    // { id, name, email, role, vendorCode?, exp }
    if (!decoded.id || !decoded.role) return null;

    const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
    if (isExpired) return null;

    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      vendorCode: decoded.vendorCode,
      avatar: decoded.avatar,
    };
  } catch {
    return null;
  }
}

const TOKEN_KEY = "auth_token";

// ─── Provider ────────────────────────────────────────────

export function AuthProvider({ children }: { children: any }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount or token change — decode & validate
  useEffect(() => {
    if (token) {
      const decoded = decodeJWT(token);
      if (decoded) {
        setUser(decoded);
      } else {
        // Token invalid or expired — clean up
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}