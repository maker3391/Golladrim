"use client";

import { useEffect } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { FoodRecommendItem } from "@/features/recommendation/types/food.types";
import styles from "./FoodCard.module.css";

interface FoodCardProps {
  food: FoodRecommendItem | null;
  status: "SUCCESS" | "FALLBACK" | null;
  actionsDisabled?: boolean;
  onLike: () => void;
  onDislike: () => void;
  onReady?: () => void;
}

export default function FoodCard({
  food,
  status,
  actionsDisabled = false,
  onLike,
  onDislike,
  onReady,
}: FoodCardProps) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  if (!food) return null;

  return (
    <article className={styles.card}>
      <div className={styles.content}>
        {status === "FALLBACK" && (
          <p className={styles.fallback}>
            딱 맞는 메뉴는 없지만, 오늘의 추천 메뉴예요 :)
          </p>
        )}

        <header className={styles.header}>
          <span className={styles.category}>{food.categoryName}</span>
          <h2 className={styles.name}>{food.name}</h2>
        </header>
      </div>

      <div className={styles.imageFrame}>
        {food.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={food.imageUrl} alt={food.name} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden="true" />
        )}
      </div>

      <div className={styles.content}>
        {food.reason && <p className={styles.reason}>{food.reason}</p>}

        <div className={styles.actions}>
          <button
            className={styles.likeButton}
            type="button"
            onClick={onLike}
            disabled={actionsDisabled}
          >
            <ThumbsUp aria-hidden="true" size={17} strokeWidth={2.2} />
            <span>
              <strong>좋아요</strong>
              <small>근처 맛집을 찾아드려요</small>
            </span>
          </button>

          <button
            className={styles.dislikeButton}
            type="button"
            onClick={onDislike}
            disabled={actionsDisabled}
          >
            <ThumbsDown aria-hidden="true" size={17} strokeWidth={2.2} />
            <span>
              <strong>싫어요</strong>
              <small>다른 메뉴를 추천해드려요</small>
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}
