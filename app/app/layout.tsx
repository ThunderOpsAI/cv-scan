import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Analytics } from "@vercel/analytics/next";

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
      <body className="font-sans">
        {/* Beta Banner */}
        <div className="w-full bg-yellow-400 text-black text-center py-2 font-semibold text-sm z-50 sticky top-0 shadow-md">
          Beta – No authentication or payments required. All features are open and free during public beta.
        </div>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
