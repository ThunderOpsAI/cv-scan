export function plainAiText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/g, (block) =>
      block
        .replace(/^```[a-zA-Z0-9_-]*\s*/, "")
        .replace(/```$/, "")
    )
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(^|\s)#{1,6}\s+/g, "$1")
    .replace(/(^|\s)([*_]{1,3})(\S(?:.*?\S)?)\2(?=\s|$|[.,;:!?])/g, "$1$3")
    .replace(/(^|\s)~~(\S(?:.*?\S)?)~~(?=\s|$|[.,;:!?])/g, "$1$2")
    .replace(/^\s*[-*+]\s+/gm, "- ")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
