"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import BrandLogo from "@/components/common/BrandLogo/BrandLogo";
import { authApi } from "@/features/auth/api/authApi";
import AuthModal from "@/features/auth/components/AuthModal/AuthModal";
import { useAuthStore } from "@/features/auth/store/authStore";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      toast.success("로그아웃되었습니다.");
    } catch (error) {
      logout();
      toast.error(
        getApiErrorMessage(error, "로그아웃 처리 중 문제가 발생했습니다."),
      );
    }
  };

  return (
    <>
      <header className={styles.navbar}>
        <div className={styles.brand}>
          <BrandLogo size="nav" />
          <span className={styles.brandTagline}>AI가 제안하는 맞춤 스팟</span>
        </div>

        <div className={styles.actions}>
          {user ? (
            <button
              type="button"
              className={styles.signupButton}
              onClick={handleLogout}
            >
              로그아웃
            </button>
          ) : (
            <button
              type="button"
              className={styles.signupButton}
              onClick={() => setIsAuthModalOpen(true)}
            >
              로그인
            </button>
          )}
        </div>
      </header>

      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </>
  );
}
