"use client";

import BrandLogo from "@/components/common/BrandLogo/BrandLogo";
import { motion } from "framer-motion";
import styles from "./HeroSection.module.css";

const reveal = {
  hidden: {
    opacity: 0,
    y: 16,
    filter: "blur(10px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

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
          staggerChildren: 0.12,
          delayChildren: 0.08,
        }}
      >
        <motion.div
          className={styles.brand}
          variants={reveal}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandLogo size="lg" />
        </motion.div>

        <motion.h1
          className={styles.title}
          variants={reveal}
          transition={{ duration: 0.82, ease: [0.22, 1, 0.36, 1] }}
        >
          오늘 뭐 먹지?
        </motion.h1>

        <p className={styles.description}>
          오늘의 선택을 더 가볍게
        </p>

        <motion.div
          className={styles.actions}
          variants={reveal}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className={styles.primaryButton}>시작하기</button>
          <button className={styles.secondaryButton}>서비스 소개</button>
        </motion.div>
      </motion.div>
    </section>
  );
}
