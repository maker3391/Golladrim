import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import AuthInitializer from "@/app/providers/AuthInitializer";
import ToastProvider from "@/app/providers/ToastProvider";
import KakaoMapPreloader from "@/features/map/components/KakaoMapPreloader";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Golladrim | 골라드림",
  description:
    "오늘 뭐 먹지? AI 기반 추천 흐름으로 음식 선택을 더 가볍게 만듭니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${notoSansKr.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://dapi.kakao.com" />
        <link rel="preconnect" href="https://t1.daumcdn.net" />
      </head>
      <body className="min-h-full flex flex-col">
        <KakaoMapPreloader />
        <AuthInitializer>{children}</AuthInitializer>
        <ToastProvider />
      </body>
    </html>
  );
}
