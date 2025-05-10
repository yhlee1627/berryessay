import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BerryEssay - 일일 에세이 작성 및 AI 첨삭",
  description: "매일 에세이를 작성하고 AI의 첨삭을 받아보세요.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body className={inter.className}>
        <main className="w-full min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
