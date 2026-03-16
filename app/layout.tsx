import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CVScan – AI Job Search Assistant",
  description:
    "CVScan is the AI-powered job search assistant that helps candidates score, tailor, and track every application — from discovery to offer.",
  keywords: [
    "resume",
    "bullet points",
    "cover letter",
    "AI",
    "job search",
    "ATS",
    "job applications",
    "career assistant",
  ],
  openGraph: {
    title: "CVScan – AI Job Search Assistant",
    description:
      "CVScan is the AI-powered job search assistant that helps candidates score, tailor, and track every application — from discovery to offer.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

