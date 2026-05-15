import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
  name?: string;
};

const parseJwt = (token: string): JwtPayload | null => {
  try {
    if (typeof window === "undefined") return null;
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const decoded = window.atob(padded);
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
};

const buildUserFromToken = (token: string): User | null => {
  const payload = parseJwt(token);
  if (!payload?.sub || !payload.email || !payload.role) return null;
  return {
    id: payload.sub,
    name: payload.name ?? "",
    email: payload.email,
    role: payload.role,
  };
};

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User | null, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        const resolvedUser = user ?? buildUserFromToken(token);
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
        set({ user: resolvedUser, token });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        set({ user: null, token: null });
      },
    }),
    {
      name: "auth-storage", // stores state into localStorage
      onRehydrateStorage: () => (state) => {
        if (state?.token && !state.user) {
          state.login(null, state.token);
        }
      },
    },
  ),
);
