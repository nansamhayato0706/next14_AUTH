// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navigation from "@/components/Navigation"; // ← 追加

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ユーザー管理システム",
  description: "ユーザー管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <Providers>
          <Navigation /> {/* ← ナビゲーションを追加 */}
          <main className="main-content">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
