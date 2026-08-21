// Creates (or resets the password for) the single admin user.
// Run with: npm run db:seed
//
// Set ADMIN_SEED_USERNAME / ADMIN_SEED_PASSWORD in .env to choose your own
// credentials. Defaults to the project's known initial account, seeded with
// mustChangePassword=true so the temporary password is forced to rotate on
// first login (see src/app/admin/change-password) rather than lingering.
//
// Re-seeding an EXISTING user only resets the password if you explicitly
// pass ADMIN_SEED_PASSWORD — it never silently overwrites a password an
// admin has already changed, and never clears mustChangePassword once unset.

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma/client";

const DEFAULT_USERNAME = "bkarthik0404@gmail.com";
const DEFAULT_PASSWORD = "admin@123";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const username = process.env.ADMIN_SEED_USERNAME || DEFAULT_USERNAME;
  const explicitPassword = process.env.ADMIN_SEED_PASSWORD;
  const password = explicitPassword || DEFAULT_PASSWORD;

  const existing = await prisma.adminUser.findUnique({ where: { username } });

  if (existing && !explicitPassword) {
    console.log(`\nAdmin user already exists: ${existing.username} — password left unchanged.`);
    console.log("Pass ADMIN_SEED_PASSWORD=<new password> to reset it explicitly.\n");
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const user = await prisma.adminUser.upsert({
    where: { username },
    create: { username, passwordHash, mustChangePassword: true },
    update: { passwordHash, mustChangePassword: true },
  });

  console.log(`\nAdmin user ready: ${user.username}`);
  console.log(
    explicitPassword ? "Password set from ADMIN_SEED_PASSWORD." : `Temporary password: ${password}`
  );
  console.log("mustChangePassword is set — the account is locked to /admin/change-password until it's changed.\n");

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
