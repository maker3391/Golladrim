"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Script from "next/script";
import { motion } from "framer-motion";
import { LocateFixed } from "lucide-react";
import styles from "./MapPanel.module.css";

type KakaoLatLng = object;

interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  addControl: (control: object | HTMLElement, position: number) => void;
}

interface KakaoMarker {
  setMap: (map: KakaoMap | null) => void;
}

interface KakaoMaps {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (container: HTMLElement, options: { center: KakaoLatLng; level: number }) => KakaoMap;
  ZoomControl: new () => object;
  MapTypeControl: new () => object;
  Marker: new (options: { map: KakaoMap; position: KakaoLatLng; title?: string }) => KakaoMarker;
  ControlPosition: { TOPRIGHT: number; RIGHT: number };
}

declare global {
  interface Window {
    kakao?: { maps?: KakaoMaps };
  }
}

const KAKAO_MAP_APP_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;

interface MapPanelProps {
  location?: { latitude: number; longitude: number; name: string };
}

export default function MapPanel({ location }: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const currentMarkerRef = useRef<KakaoMarker | null>(null);
  const placeMarkerRef = useRef<KakaoMarker | null>(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapStatus, setMapStatus] = useState<string | null>("지도를 불러오는 중입니다.");

  const moveToCurrentLocation = useCallback(() => {
    const maps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;

    if (!navigator.geolocation) {
      setMapStatus("브라우저에서 현재 위치를 지원하지 않습니다.");
      return;
    }

    setMapStatus("현재 위치를 확인하는 중입니다.");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const pos = new maps.LatLng(coords.latitude, coords.longitude);
        currentMarkerRef.current?.setMap(null);
        currentMarkerRef.current = new maps.Marker({ map, position: pos, title: "현재 위치" });
        map.setCenter(pos);
        map.setLevel(5);
        setMapStatus(null);
      },
      () => {
        setMapStatus("현재 위치 권한을 허용하면 근처 음식점 기준으로 추천할 수 있습니다.");
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 8_000 },
    );
  }, []);

  useEffect(() => {
    if (!isSdkLoaded || !mapRef.current || mapInstanceRef.current) return;

    const maps = window.kakao?.maps;
    if (!maps) return;

    maps.load(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const center = new maps.LatLng(35.1579, 129.0597);

      mapInstanceRef.current = new maps.Map(mapRef.current, { center, level: 7 });

      mapInstanceRef.current.addControl(
        new maps.MapTypeControl(),
        maps.ControlPosition.TOPRIGHT,
      );
      mapInstanceRef.current.addControl(
        new maps.ZoomControl(),
        maps.ControlPosition.RIGHT,
      );

      const locationControlEl = document.createElement("div");
      locationControlEl.className = styles.locationControl;
      createRoot(locationControlEl).render(
        <motion.button
          className={styles.locationButton}
          type="button"
          aria-label="내 위치로 이동"
          title="내 위치로 이동"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          onClick={moveToCurrentLocation}
        >
          <span className={styles.locationPulse} aria-hidden="true" />
          <LocateFixed className={styles.locationIcon} aria-hidden="true" size={18} strokeWidth={2.2} />
        </motion.button>,
      );
      mapInstanceRef.current.addControl(locationControlEl, maps.ControlPosition.RIGHT);

      setMapError(null);
      moveToCurrentLocation();
    });
  }, [isSdkLoaded, moveToCurrentLocation]);

  useEffect(() => {
    const maps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map || !location) return;

    const pos = new maps.LatLng(location.latitude, location.longitude);
    placeMarkerRef.current?.setMap(null);
    placeMarkerRef.current = new maps.Marker({ map, position: pos, title: location.name });
    map.setCenter(pos);
    map.setLevel(4);
    setMapStatus(null);
  }, [location]);

  if (!KAKAO_MAP_APP_KEY) {
    return (
      <section className={styles.panel} aria-label="지도 영역">
        <div className={styles.mapFallback}>
          NEXT_PUBLIC_KAKAO_MAP_APP_KEY가 설정되지 않았습니다.
        </div>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="지도 영역">
      <Script
        src={`https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_MAP_APP_KEY}&autoload=false`}
        strategy="afterInteractive"
        onReady={() => {
          if (!window.kakao?.maps) {
            setMapError("Kakao 지도 SDK를 초기화하지 못했습니다.");
            return;
          }
          setIsSdkLoaded(true);
        }}
        onError={() =>
          setMapError("Kakao 지도 SDK 로드에 실패했습니다. 앱 키와 도메인을 확인해주세요.")
        }
      />
      <div ref={mapRef} className={styles.mapSurface} />
      {mapStatus && !mapError && <div className={styles.mapStatus}>{mapStatus}</div>}
      {mapError && <div className={styles.mapStatus}>{mapError}</div>}
    </section>
  );
}
