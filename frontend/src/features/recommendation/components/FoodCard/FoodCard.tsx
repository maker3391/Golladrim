"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { FoodRecommendItem } from "@/features/recommendation/types/food.types";
import styles from "./FoodCard.module.css";

interface FoodCardProps {
  food: FoodRecommendItem | null;
  status: "SUCCESS" | "FALLBACK" | null;
  loading?: boolean;
  error?: string | null;
  actionsDisabled?: boolean;
  onLike: () => void;
  onDislike: () => void;
  onReady?: () => void;
}

export default function FoodCard({
  food,
  status,
  loading = false,
  error = null,
  actionsDisabled = false,
  onLike,
  onDislike,
  onReady,
}: FoodCardProps) {
  const [imageLoaded, setImageLoaded] = useState(() => !food?.imageUrl);

  useEffect(() => {
    if (food && !food.imageUrl) onReady?.();
  }, [food, onReady]);

  useEffect(() => {
    if (imageLoaded && food?.imageUrl) onReady?.();
  }, [imageLoaded, food?.imageUrl, onReady]);

  useEffect(() => {
    if (!food?.imageUrl) return;

    const image = new Image();
    image.src = food.imageUrl;
    image.onload = () => setImageLoaded(true);
    image.onerror = () => setImageLoaded(true);

    return () => {
      image.onload = null;
      image.onerror = null;
    };
  }, [food?.imageUrl]);

  if (loading) {
    return (
      <article className={styles.card} aria-busy="true">
        <div className={styles.loadingText}>
          골라드림이 메뉴를 고르는 중이에요
          <span className={styles.loadingDots} aria-hidden="true" />
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className={styles.card}>
        <p className={styles.error}>{error}</p>
      </article>
    );
  }

  if (!food || !imageLoaded) return null;

  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
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
    </motion.article>
  );
}
