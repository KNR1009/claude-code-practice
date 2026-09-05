import type { Metadata } from "next";
import type { ReactNode } from "react";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "カンバンタスク管理",
  description: "未着手 / 進行中 / 完了 の 3 列でタスクを管理する",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        {/* 描画前にテーマを当て、ライト → ダークのちらつきを防ぐ */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
