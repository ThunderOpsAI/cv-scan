// lib/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY!
);

// Using 2.5-flash as requested (Stable 2025 release)
export const gemini = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});
