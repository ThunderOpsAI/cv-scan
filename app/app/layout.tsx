import type { Metadata } from "next";
import { IBM_Plex_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const outfit = Outfit({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-outfit",
});

const ibmPlexMono = IBM_Plex_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CVScan | Premium AI Career Workflow",
  description:
    "CVScan helps candidates score, tailor, and track every application with a premium AI workflow built for high-stakes job search.",
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
    title: "CVScan | Premium AI Career Workflow",
    description:
      "CVScan helps candidates score, tailor, and track every application with a premium AI workflow built for high-stakes job search.",
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
      <body
        className={`${outfit.variable} ${ibmPlexMono.variable} bg-[hsl(var(--app-bg))] font-sans text-white antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
