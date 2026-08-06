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
    "기획, 디자인, 풀스택 개발, 산업·경제 리서치를 연결해 비즈니스 가치로 확장하는 포트폴리오",
  metadataBase: new URL("https://portfolio-landing-chi-six.vercel.app"),
  icons: {
    icon: [
      {
        url: "/favicon_v1.png?v=20260806",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: "/favicon_v1.png?v=20260806",
    apple: "/favicon_v1.png?v=20260806",
  },
  openGraph: {
    title: "윤태준(YUN TAE JUN) | Full-stack Developer & Designer",
    description:
      "기획, 디자인, 풀스택 개발, 산업·경제 리서치를 연결해 비즈니스 가치로 확장하는 포트폴리오",
    url: "https://portfolio-landing-chi-six.vercel.app",
    images: ["/favicon_v1.png"],
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
