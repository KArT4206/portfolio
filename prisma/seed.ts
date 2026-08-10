// Creates (or resets the password for) the single admin user.
// Run with: npm run db:seed
//
// Set ADMIN_SEED_USERNAME / ADMIN_SEED_PASSWORD in .env to choose your own
// credentials. If ADMIN_SEED_PASSWORD is omitted, a random one is generated
// and printed once — copy it now, it is never stored or shown again.
//
// Re-running this script is how you reset the admin password for now
// (Phase 1 has no self-service "change password" UI yet) — just re-run with
// a new ADMIN_SEED_PASSWORD.

import "dotenv/config";
import { randomBytes } from "crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const username = process.env.ADMIN_SEED_USERNAME || "admin";
  const generatedPassword = randomBytes(12).toString("base64url");
  const password = process.env.ADMIN_SEED_PASSWORD || generatedPassword;

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const user = await prisma.adminUser.upsert({
    where: { username },
    create: { username, passwordHash },
    update: { passwordHash },
  });

  console.log(`\nAdmin user ready: ${user.username}`);
  if (!process.env.ADMIN_SEED_PASSWORD) {
    console.log(`Generated password (copy now, shown once): ${password}\n`);
  } else {
    console.log(`Password set from ADMIN_SEED_PASSWORD.\n`);
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
