import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { budgetKeys } from "./use-budgets";
import { startupKeys } from "./use-startups";
import type {
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseReportQueryParams,
  ApproveExpenseMutationInput,
  RejectExpenseMutationInput,
} from "@/lib/validations/expense.validation";
import type {
  ExpenseWithRelations,
  ApiSuccessResponse,
} from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";

// Re-export query keys for convenience (maintain backward compatibility)
export const expenseKeys = {
  all: QUERY_KEYS.EXPENSES.ALL,
  lists: () => [...QUERY_KEYS.EXPENSES.ALL, "list"] as const,
  list: QUERY_KEYS.EXPENSES.LIST,
  details: () => [...QUERY_KEYS.EXPENSES.ALL, "detail"] as const,
  detail: QUERY_KEYS.EXPENSES.DETAIL,
  pending: () => [...QUERY_KEYS.EXPENSES.ALL, "pending"] as const,
  metrics: QUERY_KEYS.EXPENSES.METRICS,
};

// Hooks
export function useExpenses(params?: ExpenseReportQueryParams) {
  return useQuery<ApiSuccessResponse<ExpenseWithRelations[]>>({
    queryKey: expenseKeys.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.append("status", params.status);
      if (params?.startupId) searchParams.append("startupId", params.startupId);
      if (params?.startDate) searchParams.append("startDate", params.startDate);
      if (params?.endDate) searchParams.append("endDate", params.endDate);

      const url = `${API_ROUTES.EXPENSES}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      return apiClient.get<ApiSuccessResponse<ExpenseWithRelations[]>>(url);
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useExpense(id: string) {
  return useQuery<ApiSuccessResponse<ExpenseWithRelations>>({
    queryKey: expenseKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<ExpenseWithRelations>>(
        API_ROUTES.EXPENSE(id)
      ),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      apiClient.post(API_ROUTES.EXPENSES, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.pending() });
      if (variables.startupId) {
        queryClient.invalidateQueries({
          queryKey: startupKeys.detail(variables.startupId),
        });
      }
      if (variables.categoryId) {
        queryClient.invalidateQueries({
          queryKey: budgetKeys.detail(variables.categoryId),
        });
      }
    },
  });
}

export function useUpdateExpense(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateExpenseInput) =>
      apiClient.patch(API_ROUTES.EXPENSE(id), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      if (variables.categoryId) {
        queryClient.invalidateQueries({
          queryKey: budgetKeys.detail(variables.categoryId),
        });
      }
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminComment }: ApproveExpenseMutationInput) =>
      apiClient.patch(API_ROUTES.EXPENSE_APPROVE(id), { adminComment }),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.pending() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.metrics() });
      // Invalidate all startups and budgets to be safe
      queryClient.invalidateQueries({ queryKey: startupKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
}

export function useRejectExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, adminComment }: RejectExpenseMutationInput) =>
      apiClient.patch(API_ROUTES.EXPENSE_REJECT(id), { adminComment }),
    onSuccess: (_response, { id }) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.pending() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.metrics() });
    },
  });
}

export function useExpenseMetrics(startupId?: string) {
  return useQuery<
    ApiSuccessResponse<{
      pendingCount: number;
      pendingTotal: number;
      approvedCount: number;
      approvedTotal?: number;
      totalCount: number;
    }>
  >({
    queryKey: [...expenseKeys.metrics(), startupId],
    queryFn: () => {
      const url = startupId
        ? `${API_ROUTES.EXPENSES_METRICS}?startupId=${startupId}`
        : API_ROUTES.EXPENSES_METRICS;
      return apiClient.get<
        ApiSuccessResponse<{
          pendingCount: number;
          pendingTotal: number;
          approvedCount: number;
          approvedTotal?: number;
          totalCount: number;
        }>
      >(url);
    },
    enabled: !startupId || !!startupId, // Always enabled
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}
