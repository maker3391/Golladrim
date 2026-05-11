"use client";

import BrandLogo from "@/components/common/BrandLogo/BrandLogo";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./HeroSection.module.css";

const reveal = {
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(12px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

const revealTransition = {
  duration: 0.72,
  ease: [0.22, 1, 0.36, 1],
} as const;

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.backgroundGlow} />
      <div className={styles.grid} />

      <div className={`${styles.orb} ${styles.orbLeft}`} />
      <div className={`${styles.orb} ${styles.orbRight}`} />

      <motion.div
        className={styles.container}
        initial="hidden"
        animate="visible"
        transition={{
          staggerChildren: 0.2,
          delayChildren: 0.18,
        }}
      >
        <motion.div className={styles.brand} variants={reveal} transition={revealTransition}>
          <BrandLogo size="lg" />
        </motion.div>

        <motion.h1 className={styles.title} variants={reveal} transition={revealTransition}>
          오늘 뭐 먹지?
        </motion.h1>

        <motion.p className={styles.description} variants={reveal} transition={revealTransition}>
          오늘의 선택을 더 가볍게
        </motion.p>

        <motion.div className={styles.actions} variants={reveal} transition={revealTransition}>
          <Link className={styles.primaryButton} href="/main">
            시작하기
          </Link>
          <button className={styles.secondaryButton}>서비스 소개</button>
        </motion.div>
      </motion.div>
    </section>
  );
}
