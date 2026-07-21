import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Neon serverless driver: Postgres over HTTPS/WebSockets (port 443).
// Required here because the local network blocks raw TCP 5432; it is also
// the recommended driver for serverless hosts like Vercel.
neonConfig.webSocketConstructor = ws;
// Route simple one-shot queries over plain HTTPS fetch (faster + most
// proxy-friendly); transactions still use the WebSocket pool.
neonConfig.poolQueryViaFetch = true;

export function createPrismaClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// Reuse one client across hot reloads in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
