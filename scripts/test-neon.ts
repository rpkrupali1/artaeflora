// Connectivity probe: talks to Neon over HTTPS (port 443), no raw TCP 5432.
import { neon } from "@neondatabase/serverless";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await sql`SELECT version(), current_database(), now()`;
  console.log("Connected to Neon over HTTPS!");
  console.log(rows[0]);
}

main().catch((e) => {
  console.error("Connection failed:", e.message);
  process.exit(1);
});
