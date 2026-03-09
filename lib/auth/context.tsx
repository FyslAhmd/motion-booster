'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  avatarUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Read the accessToken cookie from document.cookie ────────────────────────
function getAccessTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)accessToken=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

// ─── Refresh interval: refresh 2 min before the 15-min access token expires ──
const REFRESH_INTERVAL_MS = 13 * 60 * 1000; // 13 minutes

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Try to refresh tokens via the server refresh endpoint ─────────
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/v1/auth/refresh', { method: 'POST' });
      if (!res.ok) return false;

      const data = await res.json();
      if (data.success && data.data?.user && data.data?.accessToken) {
        setAccessToken(data.data.accessToken);
        setUser(data.data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  // ─── Start periodic silent refresh ─────────────────────────────────
  const startRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    refreshTimerRef.current = setInterval(() => {
      refreshSession();
    }, REFRESH_INTERVAL_MS);
  }, [refreshSession]);

  const stopRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // ─── Rehydrate session on mount ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Try /me with existing accessToken cookie
        const meRes = await fetch('/api/v1/auth/me');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (!cancelled && meData.success && meData.data?.user) {
            setUser(meData.data.user);
            // Read the access token from the cookie for socket auth etc.
            setAccessToken(getAccessTokenFromCookie());
            startRefreshTimer();
            return;
          }
        }

        // 2. Access token expired — try refreshing
        const refreshed = await refreshSession();
        if (!cancelled && refreshed) {
          startRefreshTimer();
          return;
        }

        // 3. No valid session — user needs to log in
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setAccessToken(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      stopRefreshTimer();
    };
  }, [refreshSession, startRefreshTimer, stopRefreshTimer]);

  // ─── Called after a successful login API response ──────────────────
  const login = useCallback(
    (newToken: string, userData: User) => {
      // Access token cookie is already set by the login API's Set-Cookie header.
      // We just update React state.
      setAccessToken(newToken);
      setUser(userData);
      startRefreshTimer();
    },
    [startRefreshTimer]
  );

  // ─── Patch user state from profile updates ──────────────────────
  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  // ─── Logout: clear server-side cookies & revoke tokens ─────────────
  const logout = useCallback(async () => {
    stopRefreshTimer();
    setAccessToken(null);
    setUser(null);

    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch {
      // Best effort — cookies are cleared by the server response
    }
  }, [stopRefreshTimer]);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
