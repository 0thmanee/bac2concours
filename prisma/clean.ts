/**
examine very carefuly the categories cleaning, because I get no categories on the categories routes after doing all this:
@zsh (44-114) 
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting comprehensive database clean...");

  // Clear existing data (optional - comment out if you want to keep existing data)
  console.log("🧹 Clearing existing data...");
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.progressUpdate.deleteMany();
  await prisma.budgetCategory.deleteMany();
  await prisma.category.deleteMany();
  await prisma.startup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.incubatorSettings.deleteMany();

  console.log("✅ Database clean completed.");
}

main()
  .catch((e) => {
    console.error("❌ clean error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
