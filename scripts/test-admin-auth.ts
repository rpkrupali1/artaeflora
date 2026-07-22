// Verifies the admin auth path:
//  1. bcrypt login check against the seeded AdminUser
//  2. a signed session cookie is accepted by middleware (dashboard renders)
//  3. a tampered cookie is rejected (redirect to login)
// Run: npx tsx --env-file=.env scripts/test-admin-auth.ts

import bcrypt from "bcryptjs";
import { createSessionToken, SESSION_COOKIE } from "../src/lib/auth";
import { createPrismaClient } from "../src/lib/db";

const BASE = "http://localhost:3000";
const db = createPrismaClient();

async function main() {
  const admin = await db.adminUser.findUniqueOrThrow({
    where: { email: "artaeflora@gmail.com" },
  });
  const passwordOk = await bcrypt.compare(
    process.env.ADMIN_PASSWORD ?? "ChangeMe@ArtaeFlora1",
    admin.passwordHash
  );
  console.log(`1. seeded password verifies: ${passwordOk ? "PASS" : "FAIL"}`);

  const token = await createSessionToken(admin.email);
  const ok = await fetch(`${BASE}/admin`, {
    headers: { cookie: `${SESSION_COOKIE}=${token}` },
    redirect: "manual",
  });
  const body = ok.status === 200 ? await ok.text() : "";
  console.log(
    `2. valid session reaches dashboard: ${ok.status} ${body.includes("Dashboard") ? "PASS" : "FAIL"}`
  );

  const tampered = token.slice(0, -4) + "AAAA";
  const bad = await fetch(`${BASE}/admin`, {
    headers: { cookie: `${SESSION_COOKIE}=${tampered}` },
    redirect: "manual",
  });
  console.log(
    `3. tampered session rejected: ${bad.status} → ${bad.headers.get("location")} ${
      bad.status === 307 ? "PASS" : "FAIL"
    }`
  );
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
