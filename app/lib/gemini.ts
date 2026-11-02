// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Initializes and caches the Google Generative AI client.
 * Fails fast if the server environment lacks GEMINI_API_KEY.
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing env var GEMINI_API_KEY");
  }

  return new GoogleGenerativeAI(apiKey);
}

/**
 * Gemini model wrapper using gemini-2.5-flash for low-latency generation.
 * Centralizes model selection and inference calls across resume/fit analysis.
 */
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
