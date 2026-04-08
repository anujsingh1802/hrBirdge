import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser } from '../lib/types';
import * as api from '../lib/api';

const TOKEN_KEY = 'jobportal_token';

const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  register: (email: string, password: string, name: string) => Promise<AuthUser>;
  login: (email: string, password: string) => Promise<AuthUser>;
  sendOtp: (email: string) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        if (!token) {
          if (mounted) {
            setUser(null);
          }
          return;
        }

        try {
          const me = await api.getMe(token);
          if (mounted) setUser(me);
        } catch {
          throw new Error('Session expired');
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (mounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [token]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: user?.role === 'admin',
    loading,
    async register(email: string, password: string, name: string) {
      const result = await api.registerUser({ name, email, password });
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    async login(email: string, password: string) {
      const result = await api.loginUser({ email, password });
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    async sendOtp(email: string) {
      await api.sendOtp(email);
      return true;
    },
    async verifyOtp(email: string, otp: string) {
      const result = await api.verifyOtp(email, otp);
      localStorage.setItem(TOKEN_KEY, result.token);
      setToken(result.token);
      setUser(result.user);
      return result.user;
    },
    async logout() {
      try { await api.logoutUser(); } catch {}
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    },
    async refreshUser() {
      if (!token) return null;
      try {
        const me = await api.getMe(token);
        setUser(me);
        return me;
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        return null;
      }
    },
    setUser,
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
