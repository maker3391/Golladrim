"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar/Navbar";
import MapPanel from "@/features/map/components/MapPanel/MapPanel";
import AgentIntroOverlay from "@/features/recommendation/components/AgentIntroOverlay/AgentIntroOverlay";
import RecommendationPanel from "@/features/recommendation/components/RecommendationPanel/RecommendationPanel";
import { mockRecommendations } from "@/features/recommendation/mocks/recommendations.mock";
import { RecommendationPlace } from "@/features/recommendation/types/recommendation.types";
import styles from "./page.module.css";

type UiStage = "intro" | "active";
type ChatPanelState = "collapsed" | "expanded";

const defaultPrompt = "퇴근하고 혼자 가볍게 한잔";

export default function MainPage() {
  const [stage, setStage] = useState<UiStage>("intro");
  const [panelState, setPanelState] = useState<ChatPanelState>("collapsed");
  const [userPrompt, setUserPrompt] = useState(defaultPrompt);
  const [selectedPlace, setSelectedPlace] = useState<RecommendationPlace | null>(null);
  const [locateTrigger, setLocateTrigger] = useState(0);

  function activateRecommendation(prompt: string) {
    setUserPrompt(prompt);
    setStage("active");
    setPanelState("expanded");
    setSelectedPlace(null);
    setLocateTrigger((n) => n + 1);
  }

  function toggleChatPanel() {
    if (stage !== "active") return;

    setPanelState((current) => (current === "expanded" ? "collapsed" : "expanded"));
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
        <motion.div className={styles.mapStage} layout>
          <MapPanel location={stage === "active" ? selectedPlace?.location : undefined} locateTrigger={locateTrigger} />

          <AnimatePresence>
            {stage === "intro" && <AgentIntroOverlay onSubmit={activateRecommendation} />}
          </AnimatePresence>
        </motion.div>

        <div className={styles.panelStage}>
          <RecommendationPanel
            panelState={panelState}
            userPrompt={userPrompt}
            places={mockRecommendations}
            selectedPlaceId={selectedPlace?.id ?? null}

            onTogglePanel={toggleChatPanel}
            canTogglePanel={stage === "active"}
            onSelectPlace={setSelectedPlace}
          />
        </div>
      </section>
    </main>
  );
}
