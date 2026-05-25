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
  title: {
    default: "AI Spend Audit",
    template: "%s | AI Spend Audit",
  },
  description: "Find wasted AI subscription spend and share privacy-safe audit snapshots.",
  openGraph: {
    title: "AI Spend Audit",
    description: "Find wasted AI subscription spend and share privacy-safe audit snapshots.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Spend Audit",
    description: "Find wasted AI subscription spend and share privacy-safe audit snapshots.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
