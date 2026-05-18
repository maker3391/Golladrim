"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, MapPinned, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import FoodCard from "@/features/recommendation/components/FoodCard/FoodCard";
import PlaceCard from "@/features/recommendation/components/PlaceCard/PlaceCard";
import ThinkingIndicator from "@/features/recommendation/components/ThinkingIndicator/ThinkingIndicator";
import TypingText from "@/features/recommendation/components/TypingText/TypingText";
import { useFoodRecommendation } from "@/features/recommendation/hooks/useFoodRecommendation";
import { usePlaceRecommendation } from "@/features/recommendation/hooks/usePlaceRecommendation";
import { FoodRecommendItem } from "@/features/recommendation/types/food.types";
import { PlaceResponse } from "@/features/recommendation/types/recommendation.types";
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
  | {
      type: "places";
      id: string;
      foodName: string;
      places: PlaceResponse[];
      message?: string | null;
    };

function createMessageId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

interface RecommendationPanelProps {
  panelState: ChatPanelState;
  userPrompt: string;
  selectedPlaceKey: string | null;
  onTogglePanel: () => void;
  canTogglePanel?: boolean;
  onSelectPlace?: (place: PlaceResponse | null) => void;
  onShowPlaces?: (places: PlaceResponse[]) => void;
  onTogglePlaces?: (places: PlaceResponse[]) => void;
  visiblePlaceKeys?: string[];
  onLikeFood: (food: FoodRecommendItem) => void;
  onRegisterExecute: (
    fn: (food: FoodRecommendItem, lat: number, lng: number, radius: number) => void,
  ) => void;
}

export default function RecommendationPanel({
  panelState,
  userPrompt,
  selectedPlaceKey,
  onTogglePanel,
  canTogglePanel = true,
  onSelectPlace,
  onShowPlaces,
  onTogglePlaces,
  visiblePlaceKeys = [],
  onLikeFood,
  onRegisterExecute,
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
  const { recommendPlaces, isLoading: placeLoading } = usePlaceRecommendation();

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

  function getPlaceKey(place: PlaceResponse) {
    return place.placeUrl || `${place.placeName}-${place.latitude}-${place.longitude}`;
  }

  function handleCardClick(place: PlaceResponse, places: PlaceResponse[]) {
    const placeKey = getPlaceKey(place);
    onShowPlaces?.(places);
    onSelectPlace?.(selectedPlaceKey === placeKey ? null : place);
  }

  function handleShowAll(places: PlaceResponse[]) {
    onTogglePlaces?.(places);
  }

  function isPlaceGroupVisible(places: PlaceResponse[]) {
    if (places.length === 0 || places.length !== visiblePlaceKeys.length) {
      return false;
    }

    return places.every((place, index) => getPlaceKey(place) === visiblePlaceKeys[index]);
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

  const executePlaceSearch = useCallback(async (
    food: FoodRecommendItem,
    lat: number,
    lng: number,
    radius: number,
  ) => {
    const thinkingMessageId = createMessageId();
    setActionableFoodMessageId(null);
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        type: "agent",
        id: createMessageId(),
        text: "좋은 선택이에요! 근처 맛집을 찾아볼게요",
      },
      { type: "thinking", id: thinkingMessageId },
    ]);

    if (process.env.NODE_ENV === "development") {
      console.debug("[Golladrim] place recommendation geolocation", {
        latitude: lat,
        longitude: lng,
        radius,
      });
    }

    const response = await recommendPlaces({
      foodId: food.id,
      foodName: food.name,
      latitude: lat,
      longitude: lng,
      radius,
    });

    if (!response) {
      setMessages((currentMessages) =>
        currentMessages.map((message) =>
          message.id === thinkingMessageId
            ? {
                type: "agent" as const,
                id: message.id,
                text: "근처 맛집을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
              }
            : message,
        ),
      );
      return;
    }

    setMessages((currentMessages) =>
      currentMessages.map((message) =>
        message.id === thinkingMessageId
          ? {
              type: "places" as const,
              id: message.id,
              foodName: response.foodName,
              places: response.places,
              message: response.message,
            }
          : message,
      ),
    );
    onShowPlaces?.(response.places);
  }, [onShowPlaces, recommendPlaces]);

  useEffect(() => {
    onRegisterExecute(executePlaceSearch);
  }, [executePlaceSearch, onRegisterExecute]);

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
                      actionsDisabled={message.id !== actionableFoodMessageId || placeLoading}
                      onLike={() => onLikeFood(message.food)}
                      onDislike={handleDislikeFood}
                      onReady={scrollToBottomAfterLayout}
                    />
                  </motion.div>
                );
              }

              const placeGroupVisible = isPlaceGroupVisible(message.places);

              return (
                <motion.div
                  key={message.id}
                  className={styles.resultsBlock}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.16 }}
                >
                  <div className={styles.resultsHeader}>
                    <strong>{message.foodName} 맛집</strong>
                    <span>
                      {message.places.length > 0
                        ? `${message.places.length}곳 근처 후보`
                        : "결과 없음"}
                    </span>
                  </div>

                  {message.message && (
                    <p className={styles.emptyMessage}>{message.message}</p>
                  )}

                  {message.places.length > 0 && (
                    <div className={styles.resultList}>
                      {message.places.map((place, placeIndex) => (
                        <motion.div
                          key={getPlaceKey(place)}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.22,
                            delay: 0.22 + placeIndex * 0.06,
                          }}
                        >
                          <PlaceCard
                            place={place}
                            index={placeIndex}
                            selected={selectedPlaceKey === getPlaceKey(place)}
                            onSelect={(selectedPlace) => handleCardClick(selectedPlace, message.places)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <button
                    className={styles.mapCta}
                    type="button"
                    onClick={() => handleShowAll(message.places)}
                  >
                    <MapPinned aria-hidden="true" size={17} strokeWidth={2.2} />
                    <span>
                      {placeGroupVisible
                        ? "추천 장소 위치 숨기기"
                        : "추천 장소 위치 보기"}
                    </span>
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
              placeholder="오늘의 메뉴를 골라드릴게요 예시) 점심 뭐 먹지?"
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
