// Schema push over HTTPS — replacement for `prisma db push` on networks
// that block TCP 5432 (Prisma CLI needs a direct connection; we don't have one).
//
// What it does:
//   1. `prisma migrate diff` generates the full CREATE-TABLE SQL from
//      schema.prisma (purely local, no DB connection).
//   2. DROPS the public schema on Neon and re-applies the DDL over HTTPS.
//
// ⚠ DESTRUCTIVE: wipes all data. Fine for development — run `npm run db:seed`
// afterwards. Do NOT run against a production database with real orders.
//
// Usage: npm run db:push:http

import { execSync } from "node:child_process";
import { neon } from "@neondatabase/serverless";

async function main() {
  console.log("Generating DDL from prisma/schema.prisma ...");
  const ddl = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf8" }
  );

  const sql = neon(process.env.DATABASE_URL!);

  console.log("Resetting public schema on Neon ...");
  await sql`DROP SCHEMA IF EXISTS public CASCADE`;
  await sql`CREATE SCHEMA public`;

  const statements = ddl
    .split(/;\s*[\r\n]+/)
    .map((chunk) =>
      chunk
        .split(/\r?\n/)
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim()
    )
    .filter((s) => s.length > 0);

  console.log(`Applying ${statements.length} statements ...`);
  for (const stmt of statements) {
    await sql.query(stmt);
  }

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name`;
  console.log("Tables created:", tables.map((t) => t.table_name).join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
