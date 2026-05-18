"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Navbar from "@/components/layout/Navbar/Navbar";
import LocationConfirmSheet from "@/features/map/components/LocationConfirmSheet/LocationConfirmSheet";
import MapPanel from "@/features/map/components/MapPanel/MapPanel";
import AgentIntroOverlay from "@/features/recommendation/components/AgentIntroOverlay/AgentIntroOverlay";
import RecommendationPanel from "@/features/recommendation/components/RecommendationPanel/RecommendationPanel";
import { FoodRecommendItem } from "@/features/recommendation/types/food.types";
import { PlaceResponse } from "@/features/recommendation/types/recommendation.types";
import styles from "./page.module.css";

type UiStage = "intro" | "active";
type ChatPanelState = "collapsed" | "expanded";

const defaultPrompt = "";
const PINNED_LOCATION_STORAGE_KEY = "golladrim:pinned-location";

type SearchLocation = { lat: number; lng: number };

function isSearchLocation(value: unknown): value is SearchLocation {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<SearchLocation>;
  return (
    typeof candidate.lat === "number" &&
    Number.isFinite(candidate.lat) &&
    typeof candidate.lng === "number" &&
    Number.isFinite(candidate.lng)
  );
}

function isMobileDevice() {
  return window.innerWidth <= 768 || navigator.maxTouchPoints > 0;
}

function getSavedPinnedLocation() {
  const savedLocation = window.localStorage.getItem(PINNED_LOCATION_STORAGE_KEY);
  if (!savedLocation) return null;

  try {
    const parsed: unknown = JSON.parse(savedLocation);
    return isSearchLocation(parsed) ? parsed : null;
  } catch {
    window.localStorage.removeItem(PINNED_LOCATION_STORAGE_KEY);
    return null;
  }
}

function getPlaceKey(place: PlaceResponse) {
  return place.placeUrl || `${place.placeName}-${place.latitude}-${place.longitude}`;
}

function isSamePlaceList(left: PlaceResponse[], right: PlaceResponse[]) {
  if (left.length !== right.length) return false;

  const leftKeys = left.map(getPlaceKey).join("|");
  const rightKeys = right.map(getPlaceKey).join("|");
  return leftKeys === rightKeys;
}

export default function MainPage() {
  const [stage, setStage] = useState<UiStage>("intro");
  const [panelState, setPanelState] = useState<ChatPanelState>("collapsed");
  const [userPrompt, setUserPrompt] = useState(defaultPrompt);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResponse | null>(null);
  const [visiblePlaces, setVisiblePlaces] = useState<PlaceResponse[]>([]);
  const [pinnedLocation, setPinnedLocation] = useState<SearchLocation | null>(null);
  const [userLocation, setUserLocation] = useState<SearchLocation | null>(null);
  const [locationSheet, setLocationSheet] = useState<{
    isOpen: boolean;
    pendingFood: FoodRecommendItem | null;
  }>({ isOpen: false, pendingFood: null });
  const [locateTrigger, setLocateTrigger] = useState(0);
  const [lastSearchRadius, setLastSearchRadius] = useState<number>(1000);
  const [isPlaceResultStale, setIsPlaceResultStale] = useState(false);
  const [lastFood, setLastFood] = useState<FoodRecommendItem | null>(null);
  const executePlaceSearchRef = useRef<
    ((food: FoodRecommendItem, lat: number, lng: number, radius: number) => void) | null
  >(null);

  const selectedPlaceKey = selectedPlace
    ? selectedPlace.placeUrl ||
      `${selectedPlace.placeName}-${selectedPlace.latitude}-${selectedPlace.longitude}`
    : null;

  const selectedLocation =
    stage === "active" && selectedPlace?.latitude != null && selectedPlace?.longitude != null
      ? {
          latitude: selectedPlace.latitude,
          longitude: selectedPlace.longitude,
          name: selectedPlace.placeName,
        }
      : undefined;

  const mapPlaces = useMemo(
    () =>
      visiblePlaces.map((place) => ({
        latitude: place.latitude,
        longitude: place.longitude,
        name: place.placeName,
      })),
    [visiblePlaces],
  );

  const visiblePlaceKeys = useMemo(
    () => visiblePlaces.map(getPlaceKey),
    [visiblePlaces],
  );

  useEffect(() => {
    if (isMobileDevice()) return;

    const savedLocation = getSavedPinnedLocation();
    if (!savedLocation) return;

    queueMicrotask(() => {
      setPinnedLocation(savedLocation);
    });
  }, []);

  function activateRecommendation(prompt: string) {
    setUserPrompt(prompt);
    setStage("active");
    setPanelState("expanded");
    setSelectedPlace(null);
    setVisiblePlaces([]);
    setUserLocation(null);
    if (isMobileDevice() || !pinnedLocation) {
      setLocateTrigger((n) => n + 1);
    }
  }

  function handleLocationPin(lat: number, lng: number) {
    const nextLocation = { lat, lng };
    setPinnedLocation(nextLocation);
    window.localStorage.setItem(
      PINNED_LOCATION_STORAGE_KEY,
      JSON.stringify(nextLocation),
    );
    setSelectedPlace(null);
    if (visiblePlaces.length > 0) {
      setIsPlaceResultStale(true);
    }
  }

  function handleTogglePlaces(places: PlaceResponse[]) {
    setVisiblePlaces((currentPlaces) =>
      isSamePlaceList(currentPlaces, places) ? [] : places,
    );
  }

  function toggleChatPanel() {
    if (stage !== "active") return;

    setPanelState((current) => (current === "expanded" ? "collapsed" : "expanded"));
  }

  function handleLikeFood(food: FoodRecommendItem) {
    setLocationSheet({ isOpen: true, pendingFood: food });
  }

  function handleLocationConfirm(lat: number, lng: number, radius: number) {
    const food = locationSheet.pendingFood;
    setLocationSheet({ isOpen: false, pendingFood: null });
    setLastSearchRadius(radius);
    setIsPlaceResultStale(false);

    if (food) {
      setLastFood(food);
      executePlaceSearchRef.current?.(food, lat, lng, radius);
    }
  }

  function handleRestaleSearch() {
    const lat = pinnedLocation?.lat ?? userLocation?.lat;
    const lng = pinnedLocation?.lng ?? userLocation?.lng;
    if (!lastFood || !lat || !lng) return;
    executePlaceSearchRef.current?.(lastFood, lat, lng, 1000);
    setIsPlaceResultStale(false);
  }

  function handleSheetClose() {
    setLocationSheet({ isOpen: false, pendingFood: null });
  }

  function handleChangeLocation() {
    setLocationSheet({ isOpen: false, pendingFood: null });
  }

  return (
    <main className={styles.page}>
      <Navbar />

      <section
        className={`${styles.workspace} ${
          stage === "intro" ? styles.workspaceIntro : styles.workspaceActive
        }`}
        aria-label="추천 워크스페이스"
      >
        <motion.div
          className={styles.mapStage}
          layout
        >
          <MapPanel
            location={selectedLocation}
            places={mapPlaces}
            searchLocation={pinnedLocation}
            searchRadius={lastSearchRadius}
            locateTrigger={locateTrigger}
            onLocationPin={stage === "active" ? handleLocationPin : undefined}
            onUserLocationChange={setUserLocation}
            interactive={stage === "active"}
          />

          <LocationConfirmSheet
            isOpen={locationSheet.isOpen}
            lat={pinnedLocation?.lat ?? userLocation?.lat ?? null}
            lng={pinnedLocation?.lng ?? userLocation?.lng ?? null}
            onConfirm={handleLocationConfirm}
            onChangeLocation={handleChangeLocation}
            onClose={handleSheetClose}
          />

          <AnimatePresence>
            {stage === "intro" && <AgentIntroOverlay onSubmit={activateRecommendation} />}
          </AnimatePresence>

          <AnimatePresence>
            {isPlaceResultStale && visiblePlaces.length > 0 && (
              <motion.div
                className={styles.staleBanner}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              >
                <span className={styles.staleBannerText}>
                  검색 위치가 변경됐어요 · 이 위치 기준으로 다시 찾아볼까요?
                </span>
                <div className={styles.staleBannerActions}>
                  <button
                    className={styles.staleBannerButton}
                    type="button"
                    onClick={handleRestaleSearch}
                  >
                    다시 검색
                  </button>
                  <button
                    className={styles.staleBannerClose}
                    type="button"
                    aria-label="배너 닫기"
                    onClick={() => setIsPlaceResultStale(false)}
                  >
                    <X size={14} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className={styles.panelStage}>
          <RecommendationPanel
            panelState={panelState}
            userPrompt={userPrompt}
            selectedPlaceKey={selectedPlaceKey}
            onTogglePanel={toggleChatPanel}
            canTogglePanel={stage === "active"}
            onSelectPlace={setSelectedPlace}
            onShowPlaces={setVisiblePlaces}
            onTogglePlaces={handleTogglePlaces}
            visiblePlaceKeys={visiblePlaceKeys}
            onLikeFood={handleLikeFood}
            onRegisterExecute={(fn) => {
              executePlaceSearchRef.current = fn;
            }}
          />
        </div>
      </section>
    </main>
  );
}
