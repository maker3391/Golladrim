"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { LocateFixed } from "lucide-react";
import { KAKAO_MAP_APP_KEY } from "@/features/map/components/KakaoMapSdkScript";
import { loadKakaoMapSdk } from "@/features/map/utils/loadKakaoMapSdk";
import styles from "./MapPanel.module.css";

type KakaoLatLng = object;

interface KakaoMap {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
  setDraggable: (draggable: boolean) => void;
  setZoomable: (zoomable: boolean) => void;
  addControl: (control: object | HTMLElement, position: number) => void;
  relayout: () => void;
}

interface KakaoCustomOverlay {
  setMap: (map: KakaoMap | null) => void;
  setPosition: (position: KakaoLatLng) => void;
}

interface KakaoMouseEvent {
  latLng: {
    getLat: () => number;
    getLng: () => number;
  };
}

interface KakaoMaps {
  load: (callback: () => void) => void;
  LatLng: new (lat: number, lng: number) => KakaoLatLng;
  Map: new (
    container: HTMLElement,
    options: {
      center: KakaoLatLng;
      level: number;
      draggable?: boolean;
      scrollwheel?: boolean;
      disableDoubleClickZoom?: boolean;
    },
  ) => KakaoMap;
  ZoomControl: new () => object;
  MapTypeControl: new () => object;
  CustomOverlay: new (options: {
    map: KakaoMap;
    position: KakaoLatLng;
    content: string;
    xAnchor?: number;
    yAnchor?: number;
    zIndex?: number;
  }) => KakaoCustomOverlay;
  event: {
    addListener: (
      target: KakaoMap,
      type: "click",
      callback: (mouseEvent: KakaoMouseEvent) => void,
    ) => void;
  };
  ControlPosition: { TOPRIGHT: number; RIGHT: number };
}

declare global {
  interface Window {
    kakao?: { maps?: KakaoMaps };
  }
}

const DEFAULT_MAP_LEVEL = 5;
const FOCUSED_MAP_LEVEL = 4;
const GEOLOCATION_CACHE_TTL = 30_000;
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 0,
};

interface CachedCoords {
  coords: GeolocationCoordinates;
  timestamp: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface MapPanelProps {
  location?: { latitude: number; longitude: number; name: string };
  layoutVersion?: number;
  locateTrigger?: number;
  onLocationPin?: (lat: number, lng: number) => void;
  onUserLocationChange?: (location: { lat: number; lng: number } | null) => void;
  interactive?: boolean;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function MapPanel({
  location,
  layoutVersion = 0,
  locateTrigger = 0,
  onLocationPin,
  onUserLocationChange,
  interactive = true,
}: MapPanelProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const selectedPlaceOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const userLocationOverlayRef = useRef<KakaoCustomOverlay | null>(null);
  const latestLocationRef = useRef<MapPanelProps["location"]>(location);
  const onLocationPinRef = useRef(onLocationPin);
  const onUserLocationChangeRef = useRef(onUserLocationChange);
  const cachedCoordsRef = useRef<CachedCoords | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    latestLocationRef.current = location;
  }, [location]);

  useEffect(() => {
    onLocationPinRef.current = onLocationPin;
  }, [onLocationPin]);

  useEffect(() => {
    onUserLocationChangeRef.current = onUserLocationChange;
  }, [onUserLocationChange]);

  useEffect(() => {
    onUserLocationChangeRef.current?.(
      userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : null,
    );
  }, [userLocation]);

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

  const moveToCurrentLocation = useCallback((forceRefresh = false) => {
    const maps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map || !navigator.geolocation) return;

    const applyCoords = (coords: GeolocationCoordinates) => {
      const position = new maps.LatLng(coords.latitude, coords.longitude);
      cachedCoordsRef.current = { coords, timestamp: Date.now() };
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      map.setCenter(position);
      map.setLevel(FOCUSED_MAP_LEVEL);
    };

    const cached = cachedCoordsRef.current;
    const isCacheFresh = cached && Date.now() - cached.timestamp < GEOLOCATION_CACHE_TTL;

    if (!forceRefresh && isCacheFresh) {
      applyCoords(cached.coords);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => applyCoords(coords),
      () => {},
      GEOLOCATION_OPTIONS,
    );
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initMap = (lat: number, lng: number) => {
      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      const maps = window.kakao?.maps;
      if (!maps) return;

      const center = new maps.LatLng(lat, lng);

      const mapInstance = new maps.Map(mapRef.current, {
        center,
        level: DEFAULT_MAP_LEVEL,
        draggable: interactive,
        scrollwheel: interactive,
        disableDoubleClickZoom: !interactive,
      });
      mapInstanceRef.current = mapInstance;

      mapInstance.addControl(
        new maps.MapTypeControl(),
        maps.ControlPosition.TOPRIGHT,
      );
      mapInstance.addControl(
        new maps.ZoomControl(),
        maps.ControlPosition.RIGHT,
      );

      maps.event.addListener(mapInstance, "click", (mouseEvent) => {
        if (!onLocationPinRef.current) return;
        const lat = mouseEvent.latLng.getLat();
        const lng = mouseEvent.latLng.getLng();

        const pinPosition = new maps.LatLng(lat, lng);
        mapInstance.setCenter(pinPosition);
        mapInstance.setLevel(FOCUSED_MAP_LEVEL);

        setUserLocation({
          latitude: lat,
          longitude: lng,
        });
        onLocationPinRef.current?.(lat, lng);
      });

      setMapError(null);
    };

    loadKakaoMapSdk()
      .then(() => {
        initMap(37.5665, 126.9780);
        moveToCurrentLocation(false);
      })
      .catch(() => {
        if (isMounted) {
          setMapError("Kakao 지도 SDK 로드에 실패했습니다. 환경 변수를 확인해 주세요.");
        }
      });

    return () => {
      isMounted = false;
      userLocationOverlayRef.current?.setMap(null);
      userLocationOverlayRef.current = null;
      selectedPlaceOverlayRef.current?.setMap(null);
      selectedPlaceOverlayRef.current = null;
    };
  }, [moveToCurrentLocation]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    map.setDraggable(interactive);
    map.setZoomable(interactive);
  }, [interactive]);

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

    if (!userLocation) {
      userLocationOverlayRef.current?.setMap(null);
      userLocationOverlayRef.current = null;
      return;
    }

    const pos = new maps.LatLng(userLocation.latitude, userLocation.longitude);

    if (userLocationOverlayRef.current) {
      userLocationOverlayRef.current.setPosition(pos);
      userLocationOverlayRef.current.setMap(map);
      return;
    }

    userLocationOverlayRef.current = new maps.CustomOverlay({
      map,
      position: pos,
      content: `
        <div class="${styles.userLocationOverlay}">
          <span class="${styles.userLocationPulse}" aria-hidden="true"></span>
          <span class="${styles.userLocationLabel}">내 위치</span>
          <span class="${styles.userLocationPointer}" aria-hidden="true"></span>
        </div>
      `,
      xAnchor: 0.5,
      yAnchor: 1.12,
      zIndex: 12,
    });
  }, [userLocation]);

  useEffect(() => {
    const maps = window.kakao?.maps;
    const map = mapInstanceRef.current;
    if (!maps || !map) return;

    if (!location) {
      selectedPlaceOverlayRef.current?.setMap(null);
      selectedPlaceOverlayRef.current = null;
      return;
    }

    const pos = new maps.LatLng(location.latitude, location.longitude);
    selectedPlaceOverlayRef.current?.setMap(null);
    selectedPlaceOverlayRef.current = new maps.CustomOverlay({
      map,
      position: pos,
      content: `
        <div class="${styles.selectedPlaceOverlay}">
          <span>${escapeHtml(location.name)}</span>
          <i aria-hidden="true"></i>
        </div>
      `,
      xAnchor: 0.5,
      yAnchor: 1.08,
      zIndex: 10,
    });
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
    const id = window.setTimeout(() => moveToCurrentLocation(true), 400);
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
      <div className={styles.locationControl}>
        <motion.button
          className={styles.locationButton}
          type="button"
          aria-label="현재 위치로 이동"
          title="현재 위치로 이동"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          onClick={() => moveToCurrentLocation(true)}
        >
          <LocateFixed className={styles.locationIcon} aria-hidden="true" size={18} strokeWidth={2.2} />
        </motion.button>
      </div>
      {mapError && <div className={styles.mapStatus}>{mapError}</div>}
    </section>
  );
}
