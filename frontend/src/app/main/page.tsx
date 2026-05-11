import Navbar from "@/components/layout/Navbar/Navbar";
import MapPanel from "@/features/map/components/MapPanel/MapPanel";
import RecommendationPanel from "@/features/recommendation/components/RecommendationPanel/RecommendationPanel";
import styles from "./page.module.css";

export default function MainPage() {
  return (
    <main className={styles.page}>
      <Navbar />

      <section className={styles.workspace} aria-label="추천 워크스페이스">
        <RecommendationPanel />
        <MapPanel />
      </section>
    </main>
  );
}
