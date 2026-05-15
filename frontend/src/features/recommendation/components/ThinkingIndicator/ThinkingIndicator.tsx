import styles from "./ThinkingIndicator.module.css";

export default function ThinkingIndicator() {
  return (
    <span className={styles.indicator} role="status" aria-live="polite">
      <span className={styles.dot} />
      <span className={styles.dot} />
      <span className={styles.dot} />
    </span>
  );
}
