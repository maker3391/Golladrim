"use client";
import { useState } from "react";
import { ArrowUp, MapPinned, Sparkles } from "lucide-react";
import styles from "./RecommendationPanel.module.css";

const recommendations = [
  {
    id: 1,
    name: "이자카야 스미레",
    meta: "일식 주점 · 조용한 분위기",
    description: "퇴근 후 혼자 가볍게 한 잔하기 좋은 근처 이자카야예요.",
    tags: ["혼술", "이자카야"],
  },
  {
    id: 2,
    name: "해운대 곱창 서면점",
    meta: "한식 · 든든한 저녁",
    description: "자극적인 메뉴가 당길 때 부담 없이 들르기 좋은 선택지예요.",
    tags: ["해장", "소주"],
  },
  {
    id: 3,
    name: "서면 양고기집",
    meta: "양고기 · 캐주얼 데이트",
    description: "분위기는 편하고 메뉴 선택은 확실한 저녁 식사 후보예요.",
    tags: ["데이트", "구이"],
  },
];

interface RecommendationPanelProps {
  onSelectPlace?: (id: number | null) => void;
}

export default function RecommendationPanel({ onSelectPlace }: RecommendationPanelProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [input, setInput] = useState("");

  const hasResults = recommendations.length > 0;

  function handleCardClick(id: number) {
    const next = activeId === id ? null : id;
    setActiveId(next);
    onSelectPlace?.(next);
  }

  function handleShowAll() {
    onSelectPlace?.(null);
  }

  return (
    <aside className={styles.panel} aria-label="추천 탐색 패널">
      <header className={styles.header}>
        <div className={styles.headerIcon} aria-hidden="true">
          <Sparkles size={18} strokeWidth={2.2} />
        </div>
        <div className={styles.headerText}>
          <p>Golladrim AI</p>
          <h1>추천 장소 탐색</h1>
        </div>
      </header>

      <section className={styles.conversation} aria-label="AI 추천 대화">
        <div className={styles.userPrompt}>
          <p>퇴근하고 혼자 가볍게 술 한잔 하고 싶어</p>
        </div>

        <div className={styles.agentReply}>
          <p>현재 위치 근처에서 혼자 들르기 좋고, 너무 시끄럽지 않은 곳 위주로 골라봤어요.</p>
        </div>

        {hasResults && (
          <>
            <div className={styles.resultsHeader}>
              <div>
                <p>추천 결과</p>
                <strong>{recommendations.length}곳</strong>
              </div>
              <span>근처 선호도순</span>
            </div>

            <div className={styles.resultList}>
              {recommendations.map((place) => (
                <article
                  key={place.id}
                  className={`${styles.resultCard} ${activeId === place.id ? styles.active : ""}`}
                  onClick={() => handleCardClick(place.id)}
                  aria-pressed={activeId === place.id}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleCardClick(place.id)}
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
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className={styles.footer}>
        {hasResults && (
          <button className={styles.mapCta} type="button" onClick={handleShowAll}>
            <MapPinned aria-hidden="true" size={17} strokeWidth={2.2} />
            <span>추천 장소 위치 보기</span>
          </button>
        )}

        <div className={styles.composer}>
          <input
            className={styles.composerInput}
            type="text"
            placeholder="상황이나 먹고 싶은 느낌을 입력해보세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-label="AI 추천 요청 입력"
          />
          <button className={styles.composerBtn} type="button" aria-label="AI에게 추천 요청 보내기">
            <ArrowUp aria-hidden="true" size={16} strokeWidth={2.3} />
          </button>
        </div>
      </footer>
    </aside>
  );
}
