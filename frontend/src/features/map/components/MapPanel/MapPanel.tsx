import styles from "./MapPanel.module.css";

export default function MapPanel() {
  return (
    <section className={styles.panel} aria-label="지도 영역">
      <div className={styles.mapSurface}>
        <span className={`${styles.marker} ${styles.markerPrimary}`}>추천</span>
        <span className={`${styles.marker} ${styles.markerSecondary}`}>장소</span>
      </div>
    </section>
  );
}
