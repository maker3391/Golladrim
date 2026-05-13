"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import styles from "./AgentIntroOverlay.module.css";

const promptChips = [
  "점심 뭐 먹지?",
  "속 편한 점심 추천해줘",
  "오늘은 가볍게 먹고 싶어",
  "든든한 한 끼 골라줘",
];

interface AgentIntroOverlayProps {
  onSubmit: (prompt: string) => void;
}

export default function AgentIntroOverlay({ onSubmit }: AgentIntroOverlayProps) {
  const [input, setInput] = useState("");

  function submitPrompt(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    onSubmit(trimmed);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitPrompt(input);
  }

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0, x: "-50%", y: "-46%", scale: 0.98 }}
      animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1 }}
      exit={{ opacity: 0, x: "-50%", y: "-54%", scale: 0.96 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.eyebrow}>
        <Sparkles aria-hidden="true" size={16} strokeWidth={2.3} />
        <span>Golladrim AI Agent</span>
      </div>

      <div className={styles.copy}>
        <h1>오늘 뭐 먹을지 그대로 써보세요</h1>
        <p>메뉴가 떠오르지 않아도 괜찮아요. 상황만 말해도 골라드릴게요.</p>
      </div>

      <div className={styles.chips} aria-label="추천 예시">
        {promptChips.map((chip) => (
          <button key={chip} type="button" onClick={() => submitPrompt(chip)}>
            {chip}
          </button>
        ))}
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="예시) 회사 근처에서 부담 없는 점심 골라줘"
          aria-label="AI 추천 요청 입력"
        />
        <button type="submit" aria-label="AI에게 추천 요청 보내기" disabled={!input.trim()}>
          <ArrowUp aria-hidden="true" size={18} strokeWidth={2.4} />
        </button>
      </form>

      <p className={styles.helper}>골라드림 AI가 지금 먹기 좋은 메뉴와 장소를 함께 골라드릴게요.</p>
    </motion.div>
  );
}
