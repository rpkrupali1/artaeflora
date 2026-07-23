import { logger } from "@/lib/logger";

// Next.js instrumentation hook — called for EVERY uncaught error in server
// components, server actions, and route handlers. The central safety net:
// even failures nobody wrapped in try/catch land in the logs with their route.
export async function onRequestError(
  err: unknown,
  request: { path: string; method: string },
  context: { routerKind: string; routePath: string; routeType: string }
) {
  logger.error("server.unhandled_error", {
    err,
    method: request.method,
    path: request.path,
    route: context.routePath,
    routeType: context.routeType,
  });
}

export async function register() {
  logger.info("server.started", { nodeEnv: process.env.NODE_ENV });
}
