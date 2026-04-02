import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PageTracker from "@/components/PageTracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = "https://hrtoolkit.co.kr";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "HR-Toolkit | HR 신입·초보 실무자를 위한 인사 실무 플랫폼",
    template: "%s | HR-Toolkit",
  },
  description:
    "연차 계산기, 퇴직급여 계산기, 최저임금 확인, 법령 조문 검색, HR 용어사전까지. HR 신입 담당자가 바로 쓸 수 있는 무료 인사 실무 도구 모음.",
  keywords: [
    "HR 계산기",
    "연차 계산기",
    "퇴직금 계산기",
    "최저임금 계산",
    "근로기준법",
    "HR 신입",
    "인사 실무",
    "퇴직소득세",
    "HR 용어사전",
    "법령 조문 검색",
  ],
  authors: [{ name: "HR-Toolkit", url: BASE_URL }],
  creator: "HR-Toolkit",
  publisher: "HR-Toolkit",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: BASE_URL,
    siteName: "HR-Toolkit",
    title: "HR-Toolkit | HR 신입·초보 실무자를 위한 인사 실무 플랫폼",
    description:
      "연차 계산기, 퇴직급여 계산기, 최저임금 확인, 법령 조문 검색, HR 용어사전까지. HR 신입 담당자가 바로 쓸 수 있는 무료 인사 실무 도구 모음.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HR-Toolkit - HR 신입 실무 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HR-Toolkit | HR 신입·초보 실무자를 위한 인사 실무 플랫폼",
    description:
      "연차·퇴직급여·최저임금 계산기 + 법령 조문 검색 + HR 용어사전. HR 신입이 바로 쓸 수 있는 무료 플랫폼.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: { url: "/icon.svg", type: "image/svg+xml" },
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  verification: {
    // TODO: Google Search Console 인증 코드 추가
    // google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PageTracker />
        {children}
      </body>
    </html>
  );
}
