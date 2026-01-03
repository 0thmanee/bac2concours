import { z } from "zod";
import { PAYMENT_STATUS, VALIDATION } from "@/lib/constants";

// Payment status enum schema
export const paymentStatusSchema = z.enum([
  PAYMENT_STATUS.NOT_SUBMITTED,
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.APPROVED,
  PAYMENT_STATUS.REJECTED,
]);

// Upload payment proof schema
export const uploadPaymentProofSchema = z.object({
  paymentProofUrl: z.string().url("URL de preuve de paiement invalide"),
});

// Review payment schema (admin)
export const reviewPaymentSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
}).refine(
  (data) => {
    // If rejecting, reason is required with minimum length
    if (data.action === "reject") {
      return (
        data.rejectionReason !== undefined &&
        data.rejectionReason.length >= VALIDATION.PAYMENT.REJECTION_REASON_MIN_LENGTH
      );
    }
    return true;
  },
  {
    message: `La raison du rejet doit contenir au moins ${VALIDATION.PAYMENT.REJECTION_REASON_MIN_LENGTH} caractères`,
    path: ["rejectionReason"],
  }
);

// Payment status response schema
export const paymentStatusResponseSchema = z.object({
  paymentStatus: paymentStatusSchema,
  paymentProofUrl: z.string().nullable(),
  paymentRejectionReason: z.string().nullable(),
  paymentSubmittedAt: z.date().nullable(),
  paymentReviewedAt: z.date().nullable(),
});

// Pending payments query response
export const pendingPaymentUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  paymentStatus: paymentStatusSchema,
  paymentProofUrl: z.string().nullable(),
  paymentSubmittedAt: z.date().nullable(),
  createdAt: z.date(),
});

// Type exports
export type PaymentStatusInput = z.infer<typeof paymentStatusSchema>;
export type UploadPaymentProofInput = z.infer<typeof uploadPaymentProofSchema>;
export type ReviewPaymentInput = z.infer<typeof reviewPaymentSchema>;
export type PaymentStatusResponse = z.infer<typeof paymentStatusResponseSchema>;
export type PendingPaymentUser = z.infer<typeof pendingPaymentUserSchema>;
