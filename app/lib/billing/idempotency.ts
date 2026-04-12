import type { NextRequest } from "next/server";

/**
 * Stable debit reference for idempotent retries: send header `x-idempotency-key`
 * from the client on retried requests; otherwise each call is a new charge.
 */
export function debitReferenceFromRequest(req: NextRequest, prefix: string): string {
  const header = req.headers.get("x-idempotency-key")?.trim();
  if (header && header.length > 0 && header.length <= 200) {
    return `${prefix}:${header}`;
  }
  return `${prefix}:${crypto.randomUUID()}`;
}
