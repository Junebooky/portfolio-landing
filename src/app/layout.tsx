import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "윤태준(YUN TAE JUN) | Full-stack Developer & Designer",
  description:
    "문제 해결을 설계하고 가치를 만드는 Full-stack Developer & Designer 포트폴리오",
  metadataBase: new URL("https://portfolio-landing.vercel.app"),
  openGraph: {
    title: "윤태준(YUN TAE JUN) | Full-stack Developer & Designer",
    description:
      "사용자 중심의 디자인과 견고한 기술로 비즈니스 가치를 연결하는 포트폴리오",
    type: "website",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
