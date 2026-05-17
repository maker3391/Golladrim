import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "메뉴 추천",
  description: "AI가 오늘 기분과 날씨에 맞는 메뉴를 골라드려요.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
