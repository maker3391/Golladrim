"use client";

import KakaoMapSdkScript from "@/features/map/components/KakaoMapSdkScript";
import { loadKakaoMapSdk } from "@/features/map/utils/loadKakaoMapSdk";

export default function KakaoMapPreloader() {
  return (
    <KakaoMapSdkScript
      strategy="afterInteractive"
      onReady={() => {
        loadKakaoMapSdk().catch(() => undefined);
      }}
    />
  );
}
