"use client";

import { useEffect } from "react";
import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/store/authStore";
import { hasLogoutIntent } from "@/features/auth/utils/logoutIntent";

interface AuthInitializerProps {
  children: React.ReactNode;
}

export default function AuthInitializer({ children }: AuthInitializerProps) {
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    const initializeAuth = async () => {
      if (hasLogoutIntent()) {
        logout();
        return;
      }

      try {
        const user = await authApi.getMe();
        setUser(user);
      } catch {
        logout();
      }
    };

    initializeAuth();
  }, [setUser, logout]);

  return <>{children}</>;
}
