"use client";

import { useEffect, useRef } from "react";
import KakaoMapSdkScript from "@/features/map/components/KakaoMapSdkScript";
import { loadKakaoMapSdk } from "@/features/map/utils/loadKakaoMapSdk";

type KakaoLatLng = object;

interface WarmupKakaoMaps {
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => object;
}

let hasWarmedKakaoMap = false;

export default function KakaoMapPreloader() {
  const warmupMapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (hasWarmedKakaoMap) return;

    loadKakaoMapSdk()
      .then(() => {
        if (hasWarmedKakaoMap || !warmupMapRef.current) return;

        const maps = window.kakao?.maps as WarmupKakaoMaps | undefined;
        if (!maps) return;

        const center = new maps.LatLng(37.5665, 126.9780);
        new maps.Map(warmupMapRef.current, { center, level: 7 });
        hasWarmedKakaoMap = true;
      })
      .catch(() => undefined);
  }, []);

  return (
    <>
      <KakaoMapSdkScript
        strategy="afterInteractive"
        onReady={() => {
          loadKakaoMapSdk().catch(() => undefined);
        }}
      />
      <div
        ref={warmupMapRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-360px",
          top: "-280px",
          width: "320px",
          height: "240px",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
