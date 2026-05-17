import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "골라드림 | AI 음식 추천 서비스",
    template: "골라드림 | %s",
  },
  description:
    "오늘 뭐 먹지? AI가 상황, 날씨, 기분에 맞는 메뉴를 골라드려요. 근처 맛집까지 한번에.",
  keywords: ["음식 추천", "AI 추천", "뭐먹지", "점심 추천", "메뉴 추천", "맛집 추천"],
  authors: [{ name: "골라드림" }],
  creator: "골라드림",
  metadataBase: new URL("https://golladrim.com"),
  verification: {
    google: "voxPEYTNM8z82Yd0mFRYqeRZAXfzbsCQ6WANGH98XvQ",
    other: {
      "naver-site-verification": "09138d325a3a37078415de527c9e8be5ddf7bf77",
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://golladrim.com",
    siteName: "골라드림",
    title: "골라드림 | AI 음식 추천 서비스",
    description: "오늘 뭐 먹지? AI가 상황, 날씨, 기분에 맞는 메뉴를 골라드려요.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "골라드림 AI 음식 추천 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "골라드림 | AI 음식 추천 서비스",
    description: "오늘 뭐 먹지? AI가 상황, 날씨, 기분에 맞는 메뉴를 골라드려요.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://golladrim.com",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "골라드림",
                url: "https://golladrim.com",
                description:
                  "오늘 뭐 먹지? AI가 상황, 날씨, 기분에 맞는 메뉴를 골라드려요. 근처 맛집까지 한번에.",
              },
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "골라드림",
                url: "https://golladrim.com",
                logo: "https://golladrim.com/og-image.png",
                description: "AI 기반 음식 추천 서비스",
              },
            ]),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <KakaoMapPreloader />
        <AuthInitializer>{children}</AuthInitializer>
        <ToastProvider />
      </body>
    </html>
  );
}
