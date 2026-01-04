/**
 * Seed Script - Create initial data
 */

import "dotenv/config";
import { hash } from "bcryptjs";
import prisma from "../lib/prisma";
import {
  USER_ROLE,
  USER_STATUS,
  PAYMENT_STATUS,
  SETTINGS_DEFAULTS,
} from "../lib/constants";

async function seed() {
  console.log("🌱 Starting database seeding...\n");

  // Create default settings
  console.log("Creating default settings...");
  await prisma.incubatorSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      incubatorName: SETTINGS_DEFAULTS.INCUBATOR_NAME,
    },
  });

  // Create admin user
  console.log("Creating admin user...");
  const hashedPassword = await hash("Admin123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@2baconcours.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@2baconcours.com",
      password: hashedPassword,
      role: USER_ROLE.ADMIN,
      status: USER_STATUS.ACTIVE,
      emailVerified: new Date(),
      paymentStatus: PAYMENT_STATUS.APPROVED,
    },
  });
  console.log(`  Admin created: ${admin.email}`);

  // Create sample student
  console.log("Creating sample student...");
  const studentPassword = await hash("Student123!", 12);

  const student = await prisma.user.upsert({
    where: { email: "student@example.com" },
    update: {},
    create: {
      name: "Sample Student",
      email: "student@example.com",
      password: studentPassword,
      role: USER_ROLE.STUDENT,
      status: USER_STATUS.ACTIVE,
      emailVerified: new Date(),
      paymentStatus: PAYMENT_STATUS.APPROVED,
    },
  });
  console.log(`  Student created: ${student.email}`);

  console.log("\n✅ Seeding completed successfully!");
  console.log("\n📝 Test accounts:");
  console.log("  Admin: admin@2baconcours.com / Admin123!");
  console.log("  Student: student@example.com / Student123!");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
