/**
 * Clean Script - Reset database
 * WARNING: This will delete all data!
 */

import prisma from "../lib/prisma";

async function clean() {
  console.log("🗑️  Starting database cleanup...\n");

  // Delete in order (respecting foreign key constraints)
  console.log("Deleting notifications...");
  await prisma.notification.deleteMany();

  console.log("Deleting notification preferences...");
  await prisma.notificationPreference.deleteMany();

  console.log("Deleting videos...");
  await prisma.video.deleteMany();

  console.log("Deleting books...");
  await prisma.book.deleteMany();

  console.log("Deleting settings...");
  await prisma.incubatorSettings.deleteMany();

  console.log("Deleting verification tokens...");
  await prisma.verificationToken.deleteMany();

  console.log("Deleting password reset tokens...");
  await prisma.passwordResetToken.deleteMany();

  console.log("Deleting users...");
  await prisma.user.deleteMany();

  console.log("\n✅ Database cleaned successfully!");
}

clean()
  .catch((e) => {
    console.error("❌ Clean failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
