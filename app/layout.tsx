import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/branding";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  keywords: [
    "resume scanner",
    "AI resume review",
    "cover letter",
    "job search",
    "ATS",
    "interview prep",
    "career assistant",
  ],
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
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
      <body className={manrope.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
