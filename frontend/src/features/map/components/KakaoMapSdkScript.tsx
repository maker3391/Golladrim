"use client";

import Script from "next/script";
import type { ScriptProps } from "next/script";

export const KAKAO_MAP_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
export const KAKAO_MAP_SDK_SCRIPT_ID = "kakao-map-sdk";
export const KAKAO_MAP_SDK_SRC = KAKAO_MAP_APP_KEY
  ? `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&autoload=false`
  : null;

interface KakaoMapSdkScriptProps {
  onReady?: () => void;
  onError?: () => void;
  strategy?: ScriptProps["strategy"];
}

export default function KakaoMapSdkScript({
  onReady,
  onError,
  strategy = "afterInteractive",
}: KakaoMapSdkScriptProps) {
  if (!KAKAO_MAP_APP_KEY) return null;

  return (
    <Script
      id={KAKAO_MAP_SDK_SCRIPT_ID}
      src={KAKAO_MAP_SDK_SRC ?? undefined}
      strategy={strategy}
      onReady={onReady}
      onError={onError}
    />
  );
}
