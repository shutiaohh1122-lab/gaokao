import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "高考历年录取分数查询系统",
  description: "查询全国高校历年录取分数、最低位次、招生专业与志愿推荐。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
