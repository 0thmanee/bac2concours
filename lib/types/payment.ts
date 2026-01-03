/**
 * Payment-related type definitions
 * Centralized types for the payment verification system
 */

import type { PaymentStatus as PrismaPaymentStatus } from "@prisma/client";

/**
 * Payment status values
 */
export type PaymentStatusValue = PrismaPaymentStatus;

/**
 * User's payment status information
 */
export interface PaymentStatusData {
  paymentStatus: PaymentStatusValue;
  paymentProofUrl: string | null;
  paymentRejectionReason: string | null;
  paymentSubmittedAt: Date | string | null;
  paymentReviewedAt: Date | string | null;
}

/**
 * Pending payment user (for admin review)
 */
export interface PendingPaymentUser {
  id: string;
  name: string;
  email: string;
  paymentStatus: "PENDING";
  paymentProofUrl: string | null;
  paymentSubmittedAt: Date | string | null;
  createdAt: Date | string;
}

/**
 * Payment metrics for dashboard
 */
export interface PaymentMetrics {
  notSubmitted: number;
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

/**
 * Pending payments response (admin)
 */
export interface PendingPaymentsData {
  payments: PendingPaymentUser[];
  metrics: PaymentMetrics;
}

/**
 * Payment upload result
 */
export interface PaymentUploadResult {
  id: string;
  paymentStatus: PaymentStatusValue;
  paymentProofUrl: string;
  paymentSubmittedAt: Date | string;
}

/**
 * Payment review result (admin action)
 */
export interface PaymentReviewResult {
  id: string;
  name: string;
  email: string;
  paymentStatus: PaymentStatusValue;
  paymentRejectionReason: string | null;
  paymentReviewedAt: Date | string;
}

/**
 * Payment review action type
 */
export type PaymentReviewAction = "approve" | "reject";

/**
 * Payment review request
 */
export interface PaymentReviewRequest {
  action: PaymentReviewAction;
  rejectionReason?: string;
}
