import type { Metadata } from "next";
import HeroSection from "@/components/landing/hero/HeroSection";

export const metadata: Metadata = {
  title: "AI가 골라주는 오늘의 메뉴",
  description: "뭐 먹을지 고민될 때, 골라드림 AI가 상황과 기분에 맞는 메뉴를 추천해드려요.",
  alternates: {
    canonical: "https://golladrim.com",
  },
  openGraph: {
    title: "AI가 골라주는 오늘의 메뉴",
    description: "뭐 먹을지 고민될 때, 골라드림 AI가 상황과 기분에 맞는 메뉴를 추천해드려요.",
  },
};

export default function Home() {
  return <HeroSection />;
}
