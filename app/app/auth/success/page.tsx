"use client";

import { useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { GradientButton } from "@/components/ui/GradientButton";

export default function AuthSuccess() {
  useEffect(() => {
    // Attempt to close the window automatically
    // Browsers may block this if the tab wasn't explicitly opened by a script, 
    // but it works for many email clients opening links in a new tab.
    window.close();
  }, []);

  return (
    <div className="min-h-screen bg-[#E0F2F1] flex flex-col items-center justify-center p-4">
      <GlassCard accent="emerald" className="max-w-md w-full p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#26A69A]/15 text-[#26A69A] mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[#1A237E] mb-4">Authentication Successful</h1>
        <p className="text-[#757575] mb-8">
          You have been securely signed in. You can now close this tab and return to your original window, which should have updated automatically.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => window.close()}
            className="w-full sm:w-auto rounded-full bg-[#26A69A] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2bbbad]"
          >
            Close Tab
          </button>
          <GradientButton href="/dashboard" size="md" variant="secondary">
            Go to Dashboard
          </GradientButton>
        </div>
      </GlassCard>
    </div>
  );
}
