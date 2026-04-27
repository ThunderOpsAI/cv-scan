import JSZip from "jszip";

const MAX_RESUME_FILE_SIZE = 10 * 1024 * 1024;

const SUPPORTED_TEXT_TYPES = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/rtf",
  "text/rtf",
]);

const SUPPORTED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".csv",
  ".rtf",
  ".pdf",
  ".docx",
]);

function getFileExtension(filename: string) {
  const lower = filename.toLowerCase();
  const lastDot = lower.lastIndexOf(".");
  return lastDot >= 0 ? lower.slice(lastDot) : "";
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function sanitizeExtractedText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stripControlChars(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

async function extractDocxText(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const documentXml = await zip.file("word/document.xml")?.async("string");

  if (!documentXml) {
    throw new Error("DOCX file is missing word/document.xml");
  }

  const withBreaks = documentXml
    .replace(/<\/w:p>/g, "\n")
    .replace(/<w:tab\/>/g, "\t")
    .replace(/<w:br\/>/g, "\n");

  return sanitizeExtractedText(
    decodeHtmlEntities(stripControlChars(withBreaks.replace(/<[^>]+>/g, " ")))
  );
}

async function extractPdfText(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
  const pdf = await loadingTask.promise;
  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(text);
  }

  return sanitizeExtractedText(pages.join("\n\n"));
}

function extractPlainText(buffer: Buffer) {
  return sanitizeExtractedText(new TextDecoder("utf-8").decode(buffer));
}

export function assertSupportedResumeFile(fileName: string, mimeType: string, size: number) {
  const extension = getFileExtension(fileName);

  if (size <= 0) {
    throw new Error("The selected file is empty.");
  }

  if (size > MAX_RESUME_FILE_SIZE) {
    throw new Error("Resume files must be 10 MB or smaller.");
  }

  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    throw new Error("Upload a TXT, MD, CSV, RTF, PDF, or DOCX resume file.");
  }

  if (
    extension !== ".pdf" &&
    extension !== ".docx" &&
    mimeType &&
    !SUPPORTED_TEXT_TYPES.has(mimeType)
  ) {
    throw new Error("This file type is not supported for text extraction.");
  }

  return extension;
}

export async function extractResumeTextFromFile(params: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}) {
  const { buffer, fileName, mimeType } = params;
  const extension = assertSupportedResumeFile(fileName, mimeType, buffer.byteLength);

  if (extension === ".pdf") {
    return extractPdfText(buffer);
  }

  if (extension === ".docx") {
    return extractDocxText(buffer);
  }

  return extractPlainText(buffer);
}

export function buildStoredResumePath(userId: string, fileName: string) {
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  return `${userId}/${Date.now()}-${safeName}`;
}
