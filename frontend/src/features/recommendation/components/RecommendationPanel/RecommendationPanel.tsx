"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, MapPinned, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { RecommendationPlace } from "@/features/recommendation/types/recommendation.types";
import styles from "./RecommendationPanel.module.css";

type ChatPanelState = "collapsed" | "expanded";

interface RecommendationPanelProps {
  panelState: ChatPanelState;
  userPrompt: string;
  places: RecommendationPlace[];
  selectedPlaceId: number | null;
  onSubmitPrompt: (prompt: string) => void;
  onTogglePanel: () => void;
  canTogglePanel?: boolean;
  onSelectPlace?: (place: RecommendationPlace | null) => void;
}

export default function RecommendationPanel({
  panelState,
  userPrompt,
  places,
  selectedPlaceId,
  onSubmitPrompt,
  onTogglePanel,
  canTogglePanel = true,
  onSelectPlace,
}: RecommendationPanelProps) {
  const [input, setInput] = useState("");

  const isExpanded = panelState === "expanded";
  const hasResults = places.length > 0;

  function handleCardClick(place: RecommendationPlace) {
    onSelectPlace?.(selectedPlaceId === place.id ? null : place);
  }

  function handleShowAll() {
    onSelectPlace?.(null);
  }

  function handleSubmit() {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSubmitPrompt(trimmed);
    setInput("");
  }

  return (
    <div className={`${styles.panelWrapper} ${isExpanded ? styles.wrapperExpanded : styles.wrapperCollapsed}`}>

      <button
        className={`${styles.edgeToggle} ${
          isExpanded ? styles.edgeToggleExpanded : styles.edgeToggleCollapsed
        }`}
        type="button"
        onClick={onTogglePanel}
        disabled={!canTogglePanel}
        aria-label={isExpanded ? "추천 패널 접기" : "추천 패널 펼치기"}
        title={isExpanded ? "추천 패널 접기" : "추천 패널 펼치기"}
      >
        {isExpanded ? (
          <PanelLeftClose aria-hidden="true" size={18} strokeWidth={2} />
        ) : (
          <PanelLeftOpen aria-hidden="true" size={18} strokeWidth={2} />
        )}
      </button>

      <motion.aside
        className={`${styles.panel} ${isExpanded ? styles.expanded : styles.collapsed}`}
        aria-label="AI 추천 패널"
        layout
        initial={false}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
      >
        {isExpanded && (
          <>
            <section className={styles.conversation} aria-label="AI 추천 대화">
              <motion.div
                className={styles.userPrompt}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22 }}
              >
                <p>{userPrompt}</p>
              </motion.div>

              <motion.div
                className={styles.agentReply}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.24, delay: 0.08 }}
              >
                <p>현재 위치 근처에서 요청하신 분위기에 맞는 장소를 골라봤어요.</p>
              </motion.div>

              {hasResults && (
                <motion.div
                  className={styles.resultsBlock}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.16 }}
                >
                  <div className={styles.resultsHeader}>
                    <strong>추천 결과</strong>
                    <span>{places.length}곳 · 근처 선호순</span>
                  </div>

                  <div className={styles.resultList}>
                    {places.map((place, index) => (
                      <motion.article
                        key={place.id}
                        className={`${styles.resultCard} ${
                          selectedPlaceId === place.id ? styles.active : ""
                        }`}
                        onClick={() => handleCardClick(place)}
                        aria-pressed={selectedPlaceId === place.id}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === "Enter" && handleCardClick(place)}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22, delay: 0.22 + index * 0.06 }}
                      >
                        <div className={styles.cardIndex}>{place.id}</div>
                        <div className={styles.cardBody}>
                          <h2>{place.name}</h2>
                          <p className={styles.cardMeta}>{place.meta}</p>
                          <p className={styles.cardDescription}>{place.description}</p>
                          <div className={styles.tags} aria-label={`${place.name} 태그`}>
                            {place.tags.map((tag) => (
                              <span key={tag}>{tag}</span>
                            ))}
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                </motion.div>
              )}
            </section>

            <footer className={styles.footer}>
              {hasResults && (
                <button className={styles.mapCta} type="button" onClick={handleShowAll}>
                  <MapPinned aria-hidden="true" size={17} strokeWidth={2.2} />
                  <span>추천 장소 위치 보기</span>
                </button>
              )}

              <form
                className={styles.composer}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
                <input
                  className={styles.composerInput}
                  type="text"
                  placeholder="상황이나 먹고 싶은 메뉴를 더 입력해보세요"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="AI 추천 요청 입력"
                />
                <button
                  className={styles.composerBtn}
                  type="submit"
                  aria-label="AI에게 추천 요청 보내기"
                  disabled={!input.trim()}
                >
                  <ArrowUp aria-hidden="true" size={16} strokeWidth={2.3} />
                </button>
              </form>
            </footer>
          </>
        )}
      </motion.aside>
    </div>
  );
}
