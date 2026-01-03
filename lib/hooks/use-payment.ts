import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, API_ROUTES } from "@/lib/constants";
import type { ReviewPaymentInput } from "@/lib/validations/payment.validation";
import type {
  PaymentStatusData,
  PendingPaymentUser,
  PaymentMetrics,
  PendingPaymentsData,
} from "@/lib/types/payment";

// Re-export types for convenience
export type { PendingPaymentUser, PaymentMetrics };

// Re-export query keys for convenience
export const paymentKeys = {
  all: QUERY_KEYS.PAYMENTS.ALL,
  status: QUERY_KEYS.PAYMENTS.STATUS,
  pending: QUERY_KEYS.PAYMENTS.PENDING,
};

// Get current user's payment status
export function usePaymentStatus() {
  return useQuery<ApiSuccessResponse<PaymentStatusData>>({
    queryKey: paymentKeys.status(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<PaymentStatusData>>(
        API_ROUTES.PAYMENTS_STATUS
      ),
  });
}

// Upload payment proof
export function useUploadPaymentProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(API_ROUTES.PAYMENTS_UPLOAD, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Échec de l'envoi");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.status() });
    },
  });
}

// Get pending payments (Admin)
export function usePendingPayments() {
  return useQuery<ApiSuccessResponse<PendingPaymentsData>>({
    queryKey: paymentKeys.pending(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<PendingPaymentsData>>(
        API_ROUTES.PAYMENTS_PENDING
      ),
  });
}

// Review payment (Admin)
export function useReviewPayment(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReviewPaymentInput) =>
      apiClient.post(API_ROUTES.PAYMENTS_REVIEW(userId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.pending() });
      // Also invalidate users list to update status
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
