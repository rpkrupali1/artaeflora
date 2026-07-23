// Structured logger — zero dependencies, serverless-friendly.
//
// Production: one JSON object per line on stdout/stderr — Vercel/Render
//   capture these and make them searchable (filter by level, event, orderId…).
// Development: compact human-readable lines in the terminal.
//
// Usage:
//   import { logger } from "@/lib/logger";
//   const log = logger.child({ scope: "checkout" });
//   log.info("order.created", { orderId, totalCents });
//   log.error("stripe.webhook.signature_invalid", { err });
//
// Convention: `event` is a stable dot-separated name you can grep/filter on;
// everything else goes in the data object. Errors are serialized safely.

type Level = "debug" | "info" | "warn" | "error";
const LEVELS: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

const configured = (process.env.LOG_LEVEL ?? "info").toLowerCase() as Level;
const threshold = LEVELS[configured] ?? LEVELS.info;
const json = process.env.NODE_ENV === "production";

function serialize(value: unknown): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack };
  }
  return value;
}

function emit(level: Level, context: Record<string, unknown>, event: string, data?: Record<string, unknown>) {
  if (LEVELS[level] < threshold) return;

  const payload: Record<string, unknown> = {
    time: new Date().toISOString(),
    level,
    event,
    ...context,
  };
  if (data) {
    for (const [k, v] of Object.entries(data)) payload[k] = serialize(v);
  }

  const line = json
    ? JSON.stringify(payload)
    : `[${payload.time}] ${level.toUpperCase().padEnd(5)} ${event}${
        Object.keys({ ...context, ...data }).length
          ? " " + JSON.stringify({ ...context, ...(data && Object.fromEntries(Object.entries(data).map(([k, v]) => [k, serialize(v)]))) })
          : ""
      }`;

  if (level === "error" || level === "warn") console.error(line);
  else console.log(line);
}

function make(context: Record<string, unknown>) {
  return {
    debug: (event: string, data?: Record<string, unknown>) => emit("debug", context, event, data),
    info: (event: string, data?: Record<string, unknown>) => emit("info", context, event, data),
    warn: (event: string, data?: Record<string, unknown>) => emit("warn", context, event, data),
    error: (event: string, data?: Record<string, unknown>) => emit("error", context, event, data),
    child: (extra: Record<string, unknown>) => make({ ...context, ...extra }),
  };
}

export const logger = make({});
