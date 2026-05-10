import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const ANALYTICS_EVENT_NAMES = [
  "user_signed_up",
  "resume_imported",
  "facts_reviewed",
  "job_fit_run",
  "tailoring_run",
  "cover_letter_run",
  "application_saved",
  "interview_prep_run",
  "credit_purchased",
  "credit_spent",
  "critical_error",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

type AnalyticsProperties = Record<string, unknown>;

type AnalyticsClient = Pick<SupabaseClient, "from">;
type AnalyticsInsertClient = {
  from(table: "analytics_events"): {
    insert(values: unknown): PromiseLike<{ error: unknown | null }>;
  };
};

type EmitAnalyticsEventArgs = {
  eventName: AnalyticsEventName;
  userId?: string | null;
  properties?: AnalyticsProperties;
  supabase?: AnalyticsClient;
};

type LogCriticalErrorArgs = {
  workflow: string;
  error: unknown;
  userId?: string | null;
  properties?: AnalyticsProperties;
  supabase?: AnalyticsClient;
};

const SENSITIVE_KEY_RE =
  /(email|name|resume|raw|content|description|letter|message|token|secret|password|signature|url)/i;

function sanitizeAnalyticsValue(value: unknown, depth = 0): unknown {
  if (value == null || typeof value === "boolean" || typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    return value.length > 240 ? `${value.slice(0, 237)}...` : value;
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: sanitizeAnalyticsValue(value.message),
    };
  }

  if (Array.isArray(value)) {
    if (depth >= 2) return "[array]";
    return value.slice(0, 20).map((item) => sanitizeAnalyticsValue(item, depth + 1));
  }

  if (typeof value === "object") {
    if (depth >= 2) return "[object]";

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .slice(0, 40)
        .map(([key, nestedValue]) => [
          key,
          SENSITIVE_KEY_RE.test(key) ? "[redacted]" : sanitizeAnalyticsValue(nestedValue, depth + 1),
        ])
    );
  }

  return String(value);
}

function sanitizeAnalyticsProperties(properties: AnalyticsProperties = {}): AnalyticsProperties {
  return Object.fromEntries(
    Object.entries(properties).map(([key, value]) => [
      key,
      SENSITIVE_KEY_RE.test(key) ? "[redacted]" : sanitizeAnalyticsValue(value),
    ])
  );
}

function errorProperties(error: unknown): AnalyticsProperties {
  if (error instanceof Error) {
    return {
      error_name: error.name,
      error_message: sanitizeAnalyticsValue(error.message),
    };
  }

  return {
    error_message: sanitizeAnalyticsValue(error),
  };
}

export async function emitAnalyticsEvent({
  eventName,
  userId = null,
  properties = {},
  supabase,
}: EmitAnalyticsEventArgs): Promise<boolean> {
  try {
    const client = (supabase ?? createClient()) as unknown as AnalyticsInsertClient;
    const { error } = await client.from("analytics_events").insert({
      user_id: userId,
      event_name: eventName,
      properties_json: sanitizeAnalyticsProperties(properties),
    });

    if (error) {
      console.error("Analytics event write failed:", {
        eventName,
        userId,
        error,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error("Analytics event emit failed:", {
      eventName,
      userId,
      error,
    });
    return false;
  }
}

export async function logCriticalError({
  workflow,
  error,
  userId = null,
  properties = {},
  supabase,
}: LogCriticalErrorArgs): Promise<boolean> {
  console.error(`[Critical] ${workflow}:`, error);

  return emitAnalyticsEvent({
    eventName: "critical_error",
    userId,
    supabase,
    properties: {
      workflow,
      ...errorProperties(error),
      ...properties,
    },
  });
}
