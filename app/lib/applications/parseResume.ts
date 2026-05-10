// Simple resume parser: extracts name, email, phone, education, and experience from plain text
// This is a basic example and can be improved with more advanced NLP or AI

export interface ParsedResume {
  name?: string;
  email?: string;
  phone?: string;
  education?: string[];
  experience?: string[];
  rawText: string;
}

const emailRegex = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/;
const phoneRegex = /\+?\d[\d\s().-]{7,}\d/;
const educationKeywords = ["university", "college", "bachelor", "master", "phd", "degree", "diploma"];
const experienceKeywords = ["experience", "employer", "company", "work", "position", "role"];

export function parseResumeText(text: string): ParsedResume {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const email = lines.find(l => emailRegex.test(l)) || undefined;
  const phone = lines.find(l => phoneRegex.test(l)) || undefined;
  const name = lines[0] && !emailRegex.test(lines[0]) && !phoneRegex.test(lines[0]) ? lines[0] : undefined;

  // Find education and experience sections
  const education: string[] = [];
  const experience: string[] = [];
  let currentSection: "education" | "experience" | null = null;
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (educationKeywords.some(k => lower.includes(k))) {
      currentSection = "education";
      education.push(line);
    } else if (experienceKeywords.some(k => lower.includes(k))) {
      currentSection = "experience";
      experience.push(line);
    } else if (currentSection === "education") {
      education.push(line);
    } else if (currentSection === "experience") {
      experience.push(line);
    }
  }

  return {
    name,
    email,
    phone,
    education: education.length ? education : undefined,
    experience: experience.length ? experience : undefined,
    rawText: text,
  };
}
