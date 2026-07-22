// Set (or reset) the admin password — works against whatever DATABASE_URL
// is in .env, so it can target production. Usage:
//
//   $env:NEW_ADMIN_PASSWORD="your-strong-password"
//   npx tsx --env-file=.env scripts/set-admin-password.ts
//
// Optionally set NEW_ADMIN_EMAIL to change/create a different admin login.

import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/db";

const db = createPrismaClient();

async function main() {
  const email = (process.env.NEW_ADMIN_EMAIL ?? "artaeflora@gmail.com").toLowerCase();
  const password = process.env.NEW_ADMIN_PASSWORD;

  if (!password || password.length < 10) {
    console.error("Set NEW_ADMIN_PASSWORD (at least 10 characters) before running.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await db.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash, name: "Admin" },
  });
  console.log(`Password updated for ${email}. Sessions signed with the old password stay valid until they expire — rotate AUTH_SECRET too if you suspect compromise.`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
