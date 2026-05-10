// Diff Utility - Computes changes between original and tailored resume
import { TailorDiffChange } from '@/types/job-packs';

export function computeTailorDiff(
  original: string,
  tailored: string
): TailorDiffChange[] {
  const originalLines = original.split('\n');
  const tailoredLines = tailored.split('\n');
  const changes: TailorDiffChange[] = [];

  // Simple line-by-line diff
  const originalSet = new Set(originalLines.map(l => l.trim()).filter(l => l));
  const tailoredSet = new Set(tailoredLines.map(l => l.trim()).filter(l => l));

  // Track processed lines
  const processedOriginal = new Set<string>();
  const processedTailored = new Set<string>();

  // Find unchanged lines
  for (const line of tailoredLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (originalSet.has(trimmed)) {
      changes.push({ type: 'unchanged', text: line });
      processedOriginal.add(trimmed);
      processedTailored.add(trimmed);
    }
  }

  // Find removed lines (in original but not in tailored)
  for (const line of originalLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!processedOriginal.has(trimmed) && !tailoredSet.has(trimmed)) {
      changes.push({ type: 'removed', text: line });
    }
  }

  // Find added lines (in tailored but not in original)
  for (const line of tailoredLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (!processedTailored.has(trimmed) && !originalSet.has(trimmed)) {
      changes.push({ type: 'added', text: line });
    }
  }

  // Sort changes: unchanged first, then removed, then added
  changes.sort((a, b) => {
    const order = { unchanged: 0, removed: 1, added: 2 };
    return order[a.type] - order[b.type];
  });

  return changes;
}

// More detailed word-level diff for side-by-side view
export function computeDetailedDiff(
  original: string,
  tailored: string
): { original: string; tailored: string; changes: TailorDiffChange[] } {
  const changes = computeTailorDiff(original, tailored);
  
  return {
    original,
    tailored,
    changes,
  };
}
