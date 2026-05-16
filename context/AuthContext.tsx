'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, refreshToken } from '@/lib/api';
import { jwtDecode } from 'jwt-decode';

type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  name: string;
  exp: number;
};

type AuthUser = {
  id: string;
  email: string;
  role: string;
  name: string;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setAuth = useCallback((accessToken: string) => {
    try {
      const payload = jwtDecode<JwtPayload>(accessToken);
      setToken(accessToken);
      setUser({
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        name: payload.name,
      });
      localStorage.setItem('access_token', accessToken);
    } catch {
      clearAuth();
    }
  }, []);

  const clearAuth = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('access_token');
  };

  // Restore session on mount
  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem('access_token');
      if (stored) {
        try {
          const payload = jwtDecode<JwtPayload>(stored);
          const isExpired = payload.exp * 1000 < Date.now();
          if (!isExpired) {
            setAuth(stored);
            setLoading(false);
            return;
          }
        } catch {}
      }
      // Try refresh
      try {
        const result = await refreshToken();
        setAuth(result.access_token);
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, [setAuth]);

  // Auto-refresh before expiry
  useEffect(() => {
    if (!token) return;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      const msUntilExpiry = payload.exp * 1000 - Date.now() - 60_000; // 1 min before
      if (msUntilExpiry <= 0) return;
      const timer = setTimeout(async () => {
        try {
          const result = await refreshToken();
          setAuth(result.access_token);
        } catch {
          clearAuth();
        }
      }, msUntilExpiry);
      return () => clearTimeout(timer);
    } catch {}
  }, [token, setAuth]);

  const login = async (email: string, password: string) => {
    const result = await apiLogin(email, password);
    setAuth(result.access_token);
  };

  const logout = async () => {
    if (token) {
      try {
        await apiLogout(token);
      } catch {}
    }
    clearAuth();
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, isAdmin: user?.role === 'admin' }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
