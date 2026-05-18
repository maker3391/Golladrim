"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

export default function MainPage() {
  const [stage, setStage] = useState<UiStage>("intro");
  const [panelState, setPanelState] = useState<ChatPanelState>("collapsed");
  const [userPrompt, setUserPrompt] = useState(defaultPrompt);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResponse | null>(null);
  const [pinnedLocation, setPinnedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSheet, setLocationSheet] = useState<{
    isOpen: boolean;
    pendingFood: FoodRecommendItem | null;
  }>({ isOpen: false, pendingFood: null });
  const [locateTrigger, setLocateTrigger] = useState(0);
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

  function activateRecommendation(prompt: string) {
    setUserPrompt(prompt);
    setStage("active");
    setPanelState("expanded");
    setSelectedPlace(null);
    setPinnedLocation(null);
    setUserLocation(null);
    setLocateTrigger((n) => n + 1);
  }

  function handleLocationPin(lat: number, lng: number) {
    setPinnedLocation({ lat, lng });
    setSelectedPlace(null);
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

    if (food) {
      executePlaceSearchRef.current?.(food, lat, lng, radius);
    }
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
        </motion.div>

        <div className={styles.panelStage}>
          <RecommendationPanel
            panelState={panelState}
            userPrompt={userPrompt}
            selectedPlaceKey={selectedPlaceKey}
            onTogglePanel={toggleChatPanel}
            canTogglePanel={stage === "active"}
            onSelectPlace={setSelectedPlace}
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
