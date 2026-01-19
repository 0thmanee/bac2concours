import { randomBytes } from "crypto";
import prisma from "@/lib/prisma";
import { TOKEN_EXPIRY } from "@/lib/constants";

export const tokenService = {
  /**
   * Generate a cryptographically secure random token
   */
  generateToken(): string {
    return randomBytes(32).toString("hex");
  },

  /**
   * Create or update verification token for email
   */
  async createVerificationToken(email: string): Promise<string> {
    const token = this.generateToken();
    const expires = new Date(Date.now() + TOKEN_EXPIRY.VERIFICATION);

    // Delete any existing tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email },
    });

    // Create new token
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return token;
  },

  /**
   * Verify and consume verification token
   */
  async verifyEmailToken(
    token: string
  ): Promise<{ success: boolean; email?: string; error?: string }> {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { success: false, error: "Invalid or expired token" };
    }

    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return { success: false, error: "Token has expired" };
    }

    // Mark user as verified
    const user = await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });

    // Delete used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Notify admins that email was verified (async)
    const { notificationService } = await import(
      "@/lib/services/notification.service"
    );
    notificationService.onEmailVerified(user).catch(console.error);

    return { success: true, email: verificationToken.email };
  },

  /**
   * Create or update password reset token for email
   */
  async createPasswordResetToken(email: string): Promise<string> {
    const token = this.generateToken();
    const expires = new Date(Date.now() + TOKEN_EXPIRY.PASSWORD_RESET);

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email },
    });

    // Create new token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    return token;
  },

  /**
   * Verify password reset token
   */
  async verifyPasswordResetToken(
    token: string
  ): Promise<{ success: boolean; email?: string; error?: string }> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, error: "Invalid or expired token" };
    }

    if (resetToken.expires < new Date()) {
      // Delete expired token
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return { success: false, error: "Token has expired" };
    }

    return { success: true, email: resetToken.email };
  },

  /**
   * Consume password reset token (delete it after use)
   */
  async consumePasswordResetToken(token: string): Promise<void> {
    await prisma.passwordResetToken.delete({
      where: { token },
    });
  },

  /**
   * Clean up expired tokens (run this periodically)
   */
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();

    await Promise.all([
      prisma.verificationToken.deleteMany({
        where: { expires: { lt: now } },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { expires: { lt: now } },
      }),
    ]);
  },
};
