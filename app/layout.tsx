import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BulletPro - AI Resume Bullet Point Generator",
  description: "Transform your job responsibilities into powerful, ATS-optimized resume bullet points. Generate professional cover letters in seconds.",
  keywords: ["resume", "bullet points", "cover letter", "AI", "job search", "ATS"],
  openGraph: {
    title: "BulletPro - AI Resume Bullet Point Generator",
    description: "Transform your job responsibilities into powerful, ATS-optimized resume bullet points.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
