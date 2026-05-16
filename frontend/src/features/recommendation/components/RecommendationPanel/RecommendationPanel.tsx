"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, MapPinned, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import FoodCard from "@/features/recommendation/components/FoodCard/FoodCard";
import ThinkingIndicator from "@/features/recommendation/components/ThinkingIndicator/ThinkingIndicator";
import TypingText from "@/features/recommendation/components/TypingText/TypingText";
import { useFoodRecommendation } from "@/features/recommendation/hooks/useFoodRecommendation";
import { FoodRecommendItem } from "@/features/recommendation/types/food.types";
import { RecommendationPlace } from "@/features/recommendation/types/recommendation.types";
import styles from "./RecommendationPanel.module.css";

type ChatPanelState = "collapsed" | "expanded";

type ChatMessage =
  | { type: "user"; id: string; text: string }
  | { type: "agent"; id: string; text: string }
  | { type: "thinking"; id: string }
  | {
      type: "food";
      id: string;
      food: FoodRecommendItem;
      status: "SUCCESS" | "FALLBACK";
    }
  | { type: "place"; id: string };

function createMessageId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

interface RecommendationPanelProps {
  panelState: ChatPanelState;
  userPrompt: string;
  places: RecommendationPlace[];
  selectedPlaceId: number | null;
  onTogglePanel: () => void;
  canTogglePanel?: boolean;
  onSelectPlace?: (place: RecommendationPlace | null) => void;
}

export default function RecommendationPanel({
  panelState,
  userPrompt,
  places,
  selectedPlaceId,
  onTogglePanel,
  canTogglePanel = true,
  onSelectPlace,
}: RecommendationPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [actionableFoodMessageId, setActionableFoodMessageId] = useState<
    string | null
  >(null);
  const [typedAgentMessageIds, setTypedAgentMessageIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const hasInitializedPromptRef = useRef(false);
  const pendingFoodAppendRef = useRef(false);
  const pendingThinkingMessageIdRef = useRef<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const conversationRef = useRef<HTMLElement | null>(null);
  const { currentFood, status, loading, error, recommend, retry } =
    useFoodRecommendation();

  const scrollToBottom = useCallback((smooth = false) => {
    bottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "instant",
      block: "end",
    });
  }, []);

  const scrollToBottomAfterLayout = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => scrollToBottom());
    });
  }, [scrollToBottom]);

  function handleConversationScroll() {
    const el = conversationRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  }

  const isExpanded = panelState === "expanded";
  const hasPlaces = places.length > 0;
  const lastAgentMessageId = [...messages]
    .reverse()
    .find((message) => message.type === "agent")?.id;

  const markAgentTyped = useCallback((messageId: string) => {
    setTypedAgentMessageIds((currentIds) => {
      if (currentIds.has(messageId)) return currentIds;

      const nextIds = new Set(currentIds);
      nextIds.add(messageId);
      return nextIds;
    });
  }, []);

  useEffect(() => {
    if (!userPrompt.trim()) return;
    hasInitializedPromptRef.current = false;
  }, [userPrompt]);

  useEffect(() => {
    const trimmedPrompt = userPrompt.trim();

    if (!isExpanded || !trimmedPrompt || hasInitializedPromptRef.current) return;

    hasInitializedPromptRef.current = true;
    pendingFoodAppendRef.current = true;
    const thinkingMessageId = createMessageId();
    pendingThinkingMessageIdRef.current = thinkingMessageId;
    setActionableFoodMessageId(null);
    setMessages((current) => [
      ...current,
      { type: "user", id: createMessageId(), text: trimmedPrompt },
      { type: "thinking", id: thinkingMessageId },
    ]);
    void recommend(trimmedPrompt);
  }, [isExpanded, recommend, userPrompt]);

  useEffect(() => {
    if (loading || !pendingFoodAppendRef.current) return;

    if (error) {
      const pendingThinkingMessageId = pendingThinkingMessageIdRef.current;
      pendingFoodAppendRef.current = false;
      pendingThinkingMessageIdRef.current = null;
      queueMicrotask(() => {
        setActionableFoodMessageId(null);
        setMessages((currentMessages) => {
          if (!pendingThinkingMessageId) return currentMessages;

          return currentMessages.map((message) =>
            message.id === pendingThinkingMessageId
              ? { type: "agent" as const, id: message.id, text: error }
              : message,
          );
        });
      });
      return;
    }

    if (!currentFood || !status) return;

    const foodMessageId = pendingThinkingMessageIdRef.current;
    if (!foodMessageId) return;

    pendingFoodAppendRef.current = false;
    pendingThinkingMessageIdRef.current = null;
    let cancelled = false;

    const appendFood = () => {
      if (cancelled) return;
      setActionableFoodMessageId(foodMessageId);
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === foodMessageId
            ? {
                type: "food" as const,
                id: message.id,
                food: currentFood,
                status,
              }
            : message,
        ),
      );
    };

    let preloadImg: HTMLImageElement | null = null;
    if (currentFood.imageUrl) {
      preloadImg = new Image();
      preloadImg.onload = appendFood;
      preloadImg.onerror = appendFood;
      preloadImg.src = currentFood.imageUrl;
    } else {
      queueMicrotask(appendFood);
    }

    return () => {
      cancelled = true;
      if (preloadImg) {
        preloadImg.onload = null;
        preloadImg.onerror = null;
      }
    };
  }, [currentFood, error, loading, status]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typedAgentMessageIds, scrollToBottom]);

  function handleCardClick(place: RecommendationPlace) {
    onSelectPlace?.(selectedPlaceId === place.id ? null : place);
  }

  function handleShowAll() {
    onSelectPlace?.(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;

    hasInitializedPromptRef.current = true;
    pendingFoodAppendRef.current = true;
    const thinkingMessageId = createMessageId();
    pendingThinkingMessageIdRef.current = thinkingMessageId;
    setActionableFoodMessageId(null);
    setMessages((currentMessages) => [
      ...currentMessages,
      { type: "user", id: createMessageId(), text: trimmed },
      { type: "thinking", id: thinkingMessageId },
    ]);
    void recommend(trimmed);
    setInput("");
  }

  function handleLikeFood() {
    setActionableFoodMessageId(null);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        type: "agent",
        id: createMessageId(),
        text: "좋은 선택이에요! 근처 맛집을 찾아볼게요",
      },
      { type: "place", id: createMessageId() },
    ]);
  }

  function handleDislikeFood() {
    pendingFoodAppendRef.current = true;
    const thinkingMessageId = createMessageId();
    pendingThinkingMessageIdRef.current = thinkingMessageId;
    setActionableFoodMessageId(null);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        type: "agent",
        id: createMessageId(),
        text: "다른 메뉴를 찾아볼게요",
      },
      { type: "thinking", id: thinkingMessageId },
    ]);
    void retry();
  }

  function getPreviousAgentId(messageIndex: number) {
    for (let index = messageIndex - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.type === "agent") return message.id;
    }

    return null;
  }

  function canShowFoodCard(messageIndex: number) {
    const previousAgentId = getPreviousAgentId(messageIndex);

    return (
      previousAgentId === null ||
      previousAgentId !== lastAgentMessageId ||
      typedAgentMessageIds.has(previousAgentId)
    );
  }

  return (
    <div
      className={`${styles.panelWrapper} ${
        isExpanded ? styles.wrapperExpanded : styles.wrapperCollapsed
      }`}
    >
      <button
        className={`${styles.edgeToggle} ${
          isExpanded ? styles.edgeToggleExpanded : styles.edgeToggleCollapsed
        }`}
        type="button"
        onClick={onTogglePanel}
        disabled={!canTogglePanel}
        aria-label={isExpanded ? "추천 패널 닫기" : "추천 패널 열기"}
        title={isExpanded ? "추천 패널 닫기" : "추천 패널 열기"}
      >
        {isExpanded ? (
          <PanelLeftClose aria-hidden="true" size={18} strokeWidth={2} />
        ) : (
          <PanelLeftOpen aria-hidden="true" size={18} strokeWidth={2} />
        )}
      </button>

      <motion.aside
        className={`${styles.panel} ${
          isExpanded ? styles.expanded : styles.collapsed
        }`}
        aria-label="AI 추천 패널"
        layout
        initial={false}
        transition={{ type: "spring", stiffness: 260, damping: 32 }}
      >
        <section
          ref={conversationRef}
          className={styles.conversation}
          aria-label="AI 추천 대화"
          onScroll={handleConversationScroll}
        >
          <AnimatePresence initial={false}>
            {messages.map((message, index) => {
              if (message.type === "user") {
                return (
                  <motion.div
                    key={message.id}
                    className={styles.userPrompt}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <p>{message.text}</p>
                  </motion.div>
                );
              }

              if (message.type === "thinking") {
                if (messages[index - 1]?.type === "agent") return null;

                return (
                  <motion.div
                    key={message.id}
                    className={styles.agentReply}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.22 }}
                  >
                    <p><ThinkingIndicator /></p>
                  </motion.div>
                );
              }

              if (message.type === "agent") {
                if (!message.text) return null;

                const isLastAgent = message.id === lastAgentMessageId;
                const isNew = isLastAgent && !typedAgentMessageIds.has(message.id);
                const showInlineThinking = messages[index + 1]?.type === "thinking";

                return (
                  <motion.div
                    key={message.id}
                    className={styles.agentReply}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.24, delay: 0.04 }}
                  >
                    <p>
                      <TypingText
                        text={message.text}
                        isNew={isNew}
                        onDone={() => markAgentTyped(message.id)}
                      />
                      {showInlineThinking && <ThinkingIndicator />}
                    </p>
                  </motion.div>
                );
              }

              if (message.type === "food") {
                if (!canShowFoodCard(index)) return null;

                return (
                  <motion.div
                    key={message.id}
                    className={styles.resultsBlock}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.32 }}
                  >
                    <FoodCard
                      key={message.id}
                      food={message.food}
                      status={message.status}
                      actionsDisabled={message.id !== actionableFoodMessageId}
                      onLike={handleLikeFood}
                      onDislike={handleDislikeFood}
                      onReady={scrollToBottomAfterLayout}
                    />
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={message.id}
                  className={styles.resultsBlock}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.16 }}
                >
                  <div className={styles.resultsHeader}>
                    <strong>추천 결과</strong>
                    <span>
                      {hasPlaces ? `${places.length}곳 근처 후보` : "준비 중"}
                    </span>
                  </div>

                  {hasPlaces && (
                    <div className={styles.resultList}>
                      {places.map((place, placeIndex) => (
                        <motion.article
                          key={place.id}
                          className={`${styles.resultCard} ${
                            selectedPlaceId === place.id ? styles.active : ""
                          }`}
                          onClick={() => handleCardClick(place)}
                          aria-pressed={selectedPlaceId === place.id}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(event) =>
                            event.key === "Enter" && handleCardClick(place)
                          }
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.22,
                            delay: 0.22 + placeIndex * 0.06,
                          }}
                        >
                          <div className={styles.cardIndex}>{place.id}</div>
                          <div className={styles.cardBody}>
                            <h2>{place.name}</h2>
                            <p className={styles.cardMeta}>{place.meta}</p>
                            <p className={styles.cardDescription}>
                              {place.description}
                            </p>
                            <div
                              className={styles.tags}
                              aria-label={`${place.name} 태그`}
                            >
                              {place.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                              ))}
                            </div>
                          </div>
                        </motion.article>
                      ))}
                    </div>
                  )}

                  <button
                    className={styles.mapCta}
                    type="button"
                    onClick={handleShowAll}
                  >
                    <MapPinned aria-hidden="true" size={17} strokeWidth={2.2} />
                    <span>추천 장소 위치 보기</span>
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div ref={bottomRef} />
        </section>

        <AnimatePresence>
          {showScrollBtn && (
            <motion.button
              className={styles.scrollToBottomBtn}
              type="button"
              aria-label="최신 메시지로 이동"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              onClick={() => scrollToBottom(true)}
            >
              <ArrowDown aria-hidden="true" size={15} strokeWidth={2.4} />
            </motion.button>
          )}
        </AnimatePresence>

        <footer className={styles.footer}>
          <form className={styles.composer} onSubmit={handleSubmit}>
            <input
              className={styles.composerInput}
              type="text"
              placeholder="상황이나 먹고 싶은 메뉴를 입력해보세요"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="AI 추천 요청 입력"
            />
            <button
              className={styles.composerBtn}
              type="submit"
              aria-label="AI에게 추천 요청 보내기"
              disabled={!input.trim() || loading}
            >
              <ArrowUp aria-hidden="true" size={16} strokeWidth={2.3} />
            </button>
          </form>
        </footer>
      </motion.aside>
    </div>
  );
}
