import { create } from "zustand";
import { AuthUser } from "../types/auth.types";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isInitialized: true,
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    }),
}));
