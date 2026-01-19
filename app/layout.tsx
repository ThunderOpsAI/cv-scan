import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BulletPro – AI Resume Bullet Point Generator",
  description:
    "Transform your job responsibilities into powerful, ATS-optimized resume bullet points using AI.",
  keywords: [
    "resume",
    "bullet points",
    "cover letter",
    "AI",
    "job search",
    "ATS",
  ],
  openGraph: {
    title: "BulletPro – AI Resume Bullet Point Generator",
    description:
      "Transform your job responsibilities into powerful, ATS-optimized resume bullet points using AI.",
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

