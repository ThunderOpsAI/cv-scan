import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CVScan – AI Resume & Job Application Assistant",
  description:
    "Transform your job responsibilities into powerful, ATS-optimized resume bullet points using AI. Track applications and optimize your job search.",
  keywords: [
    "resume",
    "bullet points",
    "cover letter",
    "AI",
    "job search",
    "ATS",
  ],
  openGraph: {
    title: "CVScan – AI Resume & Job Application Assistant",
    description:
      "Transform your job responsibilities into powerful, ATS-optimized resume bullet points using AI. Track applications and optimize your job search.",
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

