"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { LocateFixed } from "lucide-react";
import { KAKAO_MAP_APP_KEY } from "@/features/map/components/KakaoMapSdkScript";
import { loadKakaoMapSdk } from "@/features/map/utils/loadKakaoMapSdk";
import styles from "./MapPanel.module.css";

type KakaoLatLng = object;

interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  addControl: (control: object | HTMLElement, position: number) => void;
  relayout: () => void;
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

const DEFAULT_MAP_LEVEL = 7;
const FOCUSED_MAP_LEVEL = 6;

interface MapPanelProps {
  location?: { latitude: number; longitude: number; name: string };
  layoutVersion?: number;
  locateTrigger?: number;
}

export default function MapPanel({ location, layoutVersion = 0, locateTrigger = 0 }: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const currentMarkerRef = useRef<KakaoMarker | null>(null);
  const placeMarkerRef = useRef<KakaoMarker | null>(null);
  const latestLocationRef = useRef<MapPanelProps["location"]>(location);
  const cachedCoordsRef = useRef<GeolocationCoordinates | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    latestLocationRef.current = location;
  }, [location]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { cachedCoordsRef.current = coords; },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 8_000 },
    );
  }, []);

  const relayoutMap = useCallback(() => {
    const maps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;

    map.relayout();

    const latestLocation = latestLocationRef.current;
    if (latestLocation) {
      map.setCenter(new maps.LatLng(latestLocation.latitude, latestLocation.longitude));
    }
  }, []);

  const moveToCurrentLocation = useCallback(() => {
    const maps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map || !navigator.geolocation) return;

    const applyCoords = (coords: GeolocationCoordinates) => {
      cachedCoordsRef.current = coords;
      const pos = new maps.LatLng(coords.latitude, coords.longitude);
      currentMarkerRef.current?.setMap(null);
      currentMarkerRef.current = new maps.Marker({ map, position: pos, title: "현재 위치" });
      map.setCenter(pos);
      map.setLevel(FOCUSED_MAP_LEVEL);
    };

    if (cachedCoordsRef.current) {
      applyCoords(cachedCoordsRef.current);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => applyCoords(coords),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 8_000 },
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initMap = () => {
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      const maps = window.kakao?.maps;
      if (!maps) return;

      const center = new maps.LatLng(35.1579, 129.0597);

      mapInstanceRef.current = new maps.Map(mapRef.current, { center, level: DEFAULT_MAP_LEVEL });

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
          aria-label="현재 위치로 이동"
          title="현재 위치로 이동"
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
    };

    loadKakaoMapSdk()
      .then(() => {
        initMap();
        moveToCurrentLocation();
      })
      .catch(() => {
        if (isMounted) {
          setMapError("Kakao 지도 SDK 로드에 실패했습니다. 환경 변수를 확인해주세요.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [moveToCurrentLocation]);

  useEffect(() => {
    const mapSurface = mapRef.current;
    if (!mapSurface || typeof ResizeObserver === "undefined") return;

    let timeoutId = 0;

    const scheduleRelayout = () => {
      window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(relayoutMap, 140);
    };

    const observer = new ResizeObserver(scheduleRelayout);
    observer.observe(mapSurface);

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [relayoutMap]);

  useEffect(() => {
    const maps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;

    if (!location) {
      placeMarkerRef.current?.setMap(null);
      placeMarkerRef.current = null;
      return;
    }

    const pos = new maps.LatLng(location.latitude, location.longitude);
    placeMarkerRef.current?.setMap(null);
    placeMarkerRef.current = new maps.Marker({ map, position: pos, title: location.name });
    map.setCenter(pos);
    map.setLevel(FOCUSED_MAP_LEVEL);
  }, [location]);

  useEffect(() => {
    if (!layoutVersion) return;

    const timeoutId = window.setTimeout(relayoutMap, 340);
    return () => window.clearTimeout(timeoutId);
  }, [layoutVersion, relayoutMap]);

  useEffect(() => {
    if (!locateTrigger) return;
    const id = window.setTimeout(moveToCurrentLocation, 400);
    return () => window.clearTimeout(id);
  }, [locateTrigger, moveToCurrentLocation]);

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
      <div ref={mapRef} className={styles.mapSurface} />
      {mapError && <div className={styles.mapStatus}>{mapError}</div>}
    </section>
  );
}
