"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

import styles from "./page.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const PROVIDER_LABELS = {
  google: "Google",
  kakao: "Kakao",
} as const;

type OAuthProvider = keyof typeof PROVIDER_LABELS;

function isOAuthProvider(provider: string | null): provider is OAuthProvider {
  return provider === "google" || provider === "kakao";
}

export default function OAuthAuthorizePage() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");
  const isValidProvider = isOAuthProvider(provider);

  useEffect(() => {
    if (!API_BASE_URL || !isValidProvider) return;

    window.location.replace(`${API_BASE_URL}/oauth2/authorization/${provider}`);
  }, [isValidProvider, provider]);

  const providerLabel = isValidProvider ? PROVIDER_LABELS[provider] : "소셜";
  const message = API_BASE_URL && isValidProvider
    ? `${providerLabel} 로그인 페이지로 이동 중`
    : "로그인을 시작할 수 없습니다";

  return (
    <main className={styles.page}>
      <section className={styles.panel} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <strong>{message}</strong>
      </section>
    </main>
  );
}
