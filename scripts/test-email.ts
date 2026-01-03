/**
 * Test script to verify email configuration
 * Run with: npx tsx scripts/test-email.ts
 */

import { emailService } from "../lib/email";

async function testEmail() {
  console.log("Testing email configuration...\n");

  const testEmail = "othmanebouchtaa@gmail.com"; // Your email
  const testToken = "test-token-123456";

  try {
    console.log("Attempting to send verification email...");
    const result = await emailService.sendVerificationEmail(
      testEmail,
      testToken
    );
    console.log("\n✅ Email sent successfully!");
    console.log("Result:", result);
  } catch (error: unknown) {
    console.error("\n❌ Failed to send email!");
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Error:", errorMessage);
    if (error && typeof error === "object" && "response" in error) {
      console.error("Response:", (error as { response: unknown }).response);
    }
  }
}

testEmail();
