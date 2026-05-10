// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing env var GEMINI_API_KEY");
  }

  return new GoogleGenerativeAI(apiKey);
}

// Using 2.5-flash as requested (Stable 2025 release)
export const gemini = {
  getGenerativeModel() {
    return getGeminiClient().getGenerativeModel({
      model: "gemini-2.5-flash",
    });
  },
  async generateContent(prompt: string) {
    return getGeminiClient()
      .getGenerativeModel({
        model: "gemini-2.5-flash",
      })
      .generateContent(prompt);
  },
};
