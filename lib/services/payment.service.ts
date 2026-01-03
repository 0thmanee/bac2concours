import prisma from "@/lib/prisma";
import { PAYMENT_STATUS, USER_STATUS } from "@/lib/constants";
import type { PaymentStatus } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { emailService } from "@/lib/email";

// Directory for storing payment proofs
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads", "payments");

export const paymentService = {
  /**
   * Ensure uploads directory exists
   */
  async ensureUploadsDir() {
    if (!existsSync(UPLOADS_DIR)) {
      await mkdir(UPLOADS_DIR, { recursive: true });
    }
  },

  /**
   * Upload payment proof file
   */
  async uploadPaymentProof(userId: string, file: File): Promise<string> {
    await this.ensureUploadsDir();

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.name.split(".").pop() || "jpg";
    const filename = `${userId}_${timestamp}.${extension}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    // Convert File to Buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL path
    return `/uploads/payments/${filename}`;
  },

  /**
   * Submit payment proof for a user
   */
  async submitPaymentProof(userId: string, paymentProofUrl: string) {
    // Verify user exists and hasn't already submitted
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        paymentStatus: true,
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Allow re-submission if rejected
    if (
      user.paymentStatus === PAYMENT_STATUS.PENDING ||
      user.paymentStatus === PAYMENT_STATUS.APPROVED
    ) {
      throw new Error("Une preuve de paiement a déjà été soumise");
    }

    // Update user with payment proof
    return prisma.user.update({
      where: { id: userId },
      data: {
        paymentProofUrl,
        paymentStatus: PAYMENT_STATUS.PENDING,
        paymentSubmittedAt: new Date(),
        paymentRejectionReason: null, // Clear any previous rejection reason
        paymentReviewedAt: null,
      },
      select: {
        id: true,
        paymentStatus: true,
        paymentProofUrl: true,
        paymentSubmittedAt: true,
      },
    });
  },

  /**
   * Get payment status for a user
   * Returns null if user not found (allows caller to handle gracefully)
   */
  async getPaymentStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        paymentStatus: true,
        paymentProofUrl: true,
        paymentRejectionReason: true,
        paymentSubmittedAt: true,
        paymentReviewedAt: true,
      },
    });

    // Return default status if user not found
    if (!user) {
      return {
        paymentStatus: PAYMENT_STATUS.NOT_SUBMITTED,
        paymentProofUrl: null,
        paymentRejectionReason: null,
        paymentSubmittedAt: null,
        paymentReviewedAt: null,
      };
    }

    return user;
  },

  /**
   * Approve payment (Admin only)
   */
  async approvePayment(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        paymentStatus: true,
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    if (user.paymentStatus !== PAYMENT_STATUS.PENDING) {
      throw new Error("Ce paiement ne peut pas être approuvé");
    }

    // Approve payment and activate user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        paymentStatus: PAYMENT_STATUS.APPROVED,
        paymentReviewedAt: new Date(),
        status: USER_STATUS.ACTIVE,
        emailVerified: new Date(), // Ensure email is marked as verified
      },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        paymentStatus: true,
        paymentReviewedAt: true,
      },
    });

    // Send approval email to user (async, don't block)
    emailService.sendPaymentApprovedEmail(
      user.email,
      user.name
    ).catch(error => {
      console.error("Failed to send payment approval email:", error);
      // Don't throw - email failure shouldn't block the approval
    });

    return updatedUser;
  },

  /**
   * Reject payment (Admin only)
   */
  async rejectPayment(userId: string, rejectionReason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        paymentStatus: true,
      },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    if (user.paymentStatus !== PAYMENT_STATUS.PENDING) {
      throw new Error("Ce paiement ne peut pas être rejeté");
    }

    // Reject payment
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        paymentStatus: PAYMENT_STATUS.REJECTED,
        paymentRejectionReason: rejectionReason,
        paymentReviewedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        paymentStatus: true,
        paymentRejectionReason: true,
        paymentReviewedAt: true,
      },
    });

    // Send rejection email to user (async, don't block)
    emailService.sendPaymentRejectedEmail(
      user.email,
      user.name,
      rejectionReason
    ).catch(error => {
      console.error("Failed to send payment rejection email:", error);
      // Don't throw - email failure shouldn't block the rejection
    });

    return updatedUser;
  },

  /**
   * Get all users with pending payments (Admin only)
   */
  async getPendingPayments() {
    return prisma.user.findMany({
      where: {
        paymentStatus: PAYMENT_STATUS.PENDING,
      },
      select: {
        id: true,
        name: true,
        email: true,
        paymentStatus: true,
        paymentProofUrl: true,
        paymentSubmittedAt: true,
        createdAt: true,
      },
      orderBy: {
        paymentSubmittedAt: "asc", // Oldest first
      },
    });
  },

  /**
   * Get payment metrics (Admin only)
   */
  async getPaymentMetrics() {
    const [notSubmitted, pending, approved, rejected] = await Promise.all([
      prisma.user.count({
        where: { paymentStatus: PAYMENT_STATUS.NOT_SUBMITTED },
      }),
      prisma.user.count({
        where: { paymentStatus: PAYMENT_STATUS.PENDING },
      }),
      prisma.user.count({
        where: { paymentStatus: PAYMENT_STATUS.APPROVED },
      }),
      prisma.user.count({
        where: { paymentStatus: PAYMENT_STATUS.REJECTED },
      }),
    ]);

    return {
      notSubmitted,
      pending,
      approved,
      rejected,
      total: notSubmitted + pending + approved + rejected,
    };
  },
};
