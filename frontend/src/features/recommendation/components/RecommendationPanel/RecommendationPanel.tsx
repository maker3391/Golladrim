import { Waypoints } from "lucide-react";
import styles from "./RecommendationPanel.module.css";

export default function RecommendationPanel() {
  return (
    <section className={styles.panel} aria-label="AI 추천 패널">
      <header className={styles.agentHeader}>
        <div className={styles.agentAvatar} aria-hidden="true">
          <Waypoints aria-hidden="true" size={34} strokeWidth={2.25} />
        </div>

        <div className={styles.agentTitle}>
          <h1>AI 추천 도우미</h1>
        </div>
      </header>

      <div className={styles.chatArea}>
        <article className={styles.agentBubble}>
          <p>상황이나 먹고 싶은 느낌을 입력하면 음식과 장소를 함께 추천해드릴게요.</p>
        </article>
      </div>

      <div className={styles.composer}>
        <span className={styles.placeholder}>상황이나 먹고 싶은 느낌을 입력해보세요</span>
        <button className={styles.sendButton} aria-label="메시지 보내기">
          <svg aria-hidden="true" fill="none" height="18" viewBox="0 0 18 18" width="18">
            <path
              d="M9 14.25V3.75M9 3.75L4.75 8M9 3.75L13.25 8"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.9"
            />
          </svg>
        </button>
      </div>
    </section>
  );
}
