import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Эрвээхэй Оймс",
  description: "Эрвээхэйн хээтэй, зөөлөн, удаан эдэлгээтэй оймс.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}
