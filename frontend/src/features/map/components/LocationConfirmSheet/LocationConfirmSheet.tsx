"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchGeocode } from "@/features/map/api/geocodeApi";
import { loadKakaoMapSdk } from "@/features/map/utils/loadKakaoMapSdk";
import styles from "./LocationConfirmSheet.module.css";

interface LocationConfirmSheetProps {
  isOpen: boolean;
  lat: number | null;
  lng: number | null;
  onConfirm: (lat: number, lng: number, radius: number) => void;
  onChangeLocation: () => void;
  onClose: () => void;
}

const RADIUS_OPTIONS = [500, 1000, 3000] as const;

type KakaoGeocoderStatus = string;

interface KakaoRegionResult {
  region_type?: string;
  region_1depth_name?: string;
  region_2depth_name?: string;
  region_3depth_name?: string;
}

interface KakaoGeocoder {
  coord2RegionCode: (
    lng: number,
    lat: number,
    callback: (result: KakaoRegionResult[], status: KakaoGeocoderStatus) => void,
  ) => void;
}

interface KakaoServices {
  Geocoder: new () => KakaoGeocoder;
  Status: {
    OK: KakaoGeocoderStatus;
  };
}

interface KakaoMapsWithServices {
  services?: KakaoServices;
}

function formatRadius(radius: number) {
  return radius >= 1000 ? `${radius / 1000}km` : `${radius}m`;
}

function parseRegionAddress(result: KakaoRegionResult[]) {
  const region = result.find((item) => item.region_type === "H") ?? result[0];
  if (!region) return "";

  const region2 = region.region_2depth_name?.trim() ?? "";
  const region3 = region.region_3depth_name?.trim() ?? "";
  return [region2, region3].filter(Boolean).join(" ");
}

async function reverseGeocodeWithKakaoServices(lat: number, lng: number) {
  await loadKakaoMapSdk();

  const maps = window.kakao?.maps as KakaoMapsWithServices | undefined;
  const services = maps?.services;

  if (!services?.Geocoder || !services.Status) {
    if (process.env.NODE_ENV === "development") {
      console.debug("[LocationConfirmSheet] Kakao services.Geocoder unavailable", {
        hasMaps: Boolean(window.kakao?.maps),
        hasServices: Boolean(services),
      });
    }
    return "";
  }

  return new Promise<string>((resolve) => {
    const geocoder = new services.Geocoder();

    geocoder.coord2RegionCode(lng, lat, (result, status) => {
      const address = status === services.Status.OK ? parseRegionAddress(result) : "";

      if (process.env.NODE_ENV === "development") {
        console.debug("[LocationConfirmSheet] reverse geocoding", {
          lat,
          lng,
          status,
          result,
          address,
        });
      }

      resolve(address);
    });
  });
}

export default function LocationConfirmSheet({
  isOpen,
  lat,
  lng,
  onConfirm,
  onChangeLocation,
  onClose,
}: LocationConfirmSheetProps) {
  const [selectedRadius, setSelectedRadius] = useState<number>(1000);
  const [addressLabel, setAddressLabel] = useState("위치 확인 중...");

  useEffect(() => {
    if (!isOpen) return;

    if (lat == null || lng == null) {
      setAddressLabel("위치 확인 중...");
      return;
    }

    let cancelled = false;
    setAddressLabel("위치 확인 중...");

    reverseGeocodeWithKakaoServices(lat, lng)
      .then(async (address) => {
        if (cancelled) return;
        const fallbackAddress = address || (await fetchGeocode(lat, lng));
        if (cancelled) return;
        setAddressLabel(fallbackAddress ? `${fallbackAddress} 기준` : "현재 위치 기준");
      })
      .catch(() => {
        if (cancelled) return;
        setAddressLabel("현재 위치 기준");
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, lat, lng]);

  function handleConfirm() {
    if (lat == null || lng == null) return;
    onConfirm(lat, lng, selectedRadius);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            className={styles.overlay}
            type="button"
            aria-label="위치 확인 닫기"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
          />
          <motion.section
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-label="맛집 검색 위치 확인"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
          >
            <div className={styles.handle} aria-hidden="true" />

            <header className={styles.header}>
              <p className={styles.eyebrow}>검색 위치</p>
              <h2>{addressLabel}</h2>
            </header>

            <div className={styles.radiusGroup} aria-label="검색 반경 선택">
              {RADIUS_OPTIONS.map((radius) => (
                <button
                  key={radius}
                  className={`${styles.radiusChip} ${
                    selectedRadius === radius ? styles.radiusChipActive : ""
                  }`}
                  type="button"
                  onClick={() => setSelectedRadius(radius)}
                >
                  {formatRadius(radius)}
                </button>
              ))}
            </div>

            <div className={styles.actions}>
              <button
                className={styles.secondaryButton}
                type="button"
                onClick={onChangeLocation}
              >
                위치 바꾸기
              </button>
              <button
                className={styles.primaryButton}
                type="button"
                disabled={lat == null || lng == null}
                onClick={handleConfirm}
              >
                이 위치로 검색
              </button>
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
