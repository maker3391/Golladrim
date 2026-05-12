"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { authApi } from "@/features/auth/api/authApi";
import { useAuthStore } from "@/features/auth/store/authStore";
import { getApiErrorMessage } from "@/shared/api/getApiErrorMessage";

import styles from "./AuthModal.module.css";

interface AuthModalProps {
  onClose: () => void;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const OAUTH_POPUP_WIDTH = 500;
const OAUTH_POPUP_HEIGHT = 720;
const OAUTH_POLL_INTERVAL_MS = 1000;
const OAUTH_POLL_TIMEOUT_MS = 120000;

type OAuthMessage = {
  type: "oauth2:error" | "oauth2:success";
  message?: string;
};

function GoogleIcon() {
  return (
    <svg className={styles.providerIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.94a5.08 5.08 0 0 1-2.2 3.33v2.77h3.57c2.08-1.92 3.29-4.74 3.29-8.11z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.24 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.86A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.04H2.15a11 11 0 0 0 0 9.92l3.69-2.86z" />
      <path fill="#EA4335" d="M12 5.37c1.62 0 3.07.56 4.21 1.65l3.16-3.16A10.62 10.62 0 0 0 12 1 11 11 0 0 0 2.15 7.04L5.84 9.9C6.71 7.3 9.14 5.37 12 5.37z" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg className={styles.providerIcon} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#191919"
        d="M12 4C6.75 4 2.5 7.33 2.5 11.43c0 2.66 1.78 4.99 4.45 6.3l-.72 2.64c-.06.23.2.41.4.28l3.14-2.08c.71.12 1.46.2 2.23.2 5.25 0 9.5-3.33 9.5-7.44S17.25 4 12 4z"
      />
    </svg>
  );
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const router = useRouter();

  const setUser = useAuthStore((state) => state.setUser);
  const pollIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const clearPolling = () => {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };

    const completeOAuthLogin = async () => {
      try {
        const user = await authApi.getMe();
        setUser(user);
        clearPolling();
        onClose();
        toast.success("로그인되었습니다.");
        router.replace("/main");
      } catch (error) {
        toast.error(
          getApiErrorMessage(
            error,
            "로그인 정보를 확인하지 못했습니다. 다시 시도해주세요.",
          ),
        );
      }
    };

    const handleOAuthMessage = async (event: MessageEvent<OAuthMessage>) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === "oauth2:error") {
        toast.error(event.data.message ?? "소셜 로그인 중 문제가 발생했습니다.");
        return;
      }
      if (event.data?.type !== "oauth2:success") return;

      await completeOAuthLogin();
    };

    window.addEventListener("message", handleOAuthMessage);

    return () => {
      window.removeEventListener("message", handleOAuthMessage);
      clearPolling();
    };
  }, [onClose, router, setUser]);

  const handleOAuthLogin = (provider: "google" | "kakao") => {
    if (!API_BASE_URL) {
      toast.error("API 서버 주소가 설정되지 않았습니다.");
      return;
    }

    const authUrl = `${API_BASE_URL}/oauth2/authorization/${provider}`;

    const left = window.screenX + (window.outerWidth - OAUTH_POPUP_WIDTH) / 2;
    const top = window.screenY + (window.outerHeight - OAUTH_POPUP_HEIGHT) / 2;

    const popup = window.open(
      authUrl,
      `${provider}-oauth-login`,
      `width=${OAUTH_POPUP_WIDTH},height=${OAUTH_POPUP_HEIGHT},left=${left},top=${top},resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      window.location.href = authUrl;
      return;
    }

    const startedAt = Date.now();

    if (pollIntervalRef.current) {
      window.clearInterval(pollIntervalRef.current);
    }

    pollIntervalRef.current = window.setInterval(async () => {
      if (Date.now() - startedAt > OAUTH_POLL_TIMEOUT_MS) {
        if (pollIntervalRef.current) {
          window.clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        toast.error("로그인 처리 시간이 초과되었습니다. 다시 시도해주세요.");
        return;
      }

      try {
        const user = await authApi.getMe();
        setUser(user);
        popup.close();
        if (pollIntervalRef.current) {
          window.clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        onClose();
        toast.success("로그인되었습니다.");
        router.replace("/main");
      } catch (error) {
        if (popup.closed && pollIntervalRef.current) {
          window.clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }

        if (popup.closed) {
          toast.error(
            getApiErrorMessage(
              error,
              "로그인 정보를 확인하지 못했습니다. 다시 시도해주세요.",
            ),
          );
        }
      }
    }, OAUTH_POLL_INTERVAL_MS);
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>골라드림 시작하기</h2>

        <p className={styles.description}>
          소셜 계정으로 간편하게 골라드림을 이용해보세요.
        </p>

        <div className={styles.buttonGroup}>
          <button
            type="button"
            className={styles.googleButton}
            onClick={() => handleOAuthLogin("google")}
          >
            <GoogleIcon />
            <span>Google로 계속하기</span>
            <i aria-hidden="true" />
          </button>

          <button
            type="button"
            className={styles.kakaoButton}
            onClick={() => handleOAuthLogin("kakao")}
          >
            <KakaoIcon />
            <span>Kakao로 계속하기</span>
            <i aria-hidden="true" />
          </button>
        </div>

        <button type="button" className={styles.cancelButton} onClick={onClose}>
          닫기
        </button>
      </section>
    </div>
  );
}
