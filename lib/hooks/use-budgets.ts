import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { startupKeys } from "./use-startups";
import type {
  CreateBudgetCategoryInput,
  UpdateBudgetCategoryInput,
  BudgetCategoryWithSpent,
  BudgetTotals,
} from "@/lib/validations/budget.validation";
import type {
  BudgetCategoryWithRelations,
  ApiSuccessResponse,
} from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";

// Re-export query keys for convenience (maintain backward compatibility)
export const budgetKeys = {
  all: QUERY_KEYS.BUDGETS.ALL,
  lists: () => [...QUERY_KEYS.BUDGETS.ALL, "list"] as const,
  list: QUERY_KEYS.BUDGETS.BY_STARTUP,
  details: () => [...QUERY_KEYS.BUDGETS.ALL, "detail"] as const,
  detail: QUERY_KEYS.BUDGETS.DETAIL,
};

// Hooks
export function useBudgets(
  startupId: string,
  options?: { includeSpent?: boolean }
) {
  return useQuery<
    ApiSuccessResponse<
      BudgetCategoryWithRelations[] | BudgetCategoryWithSpent[]
    >
  >({
    queryKey: [
      ...budgetKeys.list(startupId),
      options?.includeSpent ? "withSpent" : "",
    ],
    queryFn: () => {
      const url = options?.includeSpent
        ? `${API_ROUTES.STARTUP_BUDGETS(startupId)}?includeSpent=true`
        : API_ROUTES.STARTUP_BUDGETS(startupId);
      return apiClient.get<
        ApiSuccessResponse<
          BudgetCategoryWithRelations[] | BudgetCategoryWithSpent[]
        >
      >(url);
    },
    enabled: !!startupId,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useBudget(id: string) {
  return useQuery<ApiSuccessResponse<BudgetCategoryWithRelations>>({
    queryKey: budgetKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<BudgetCategoryWithRelations>>(
        API_ROUTES.BUDGET(id)
      ),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useCreateBudget(startupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetCategoryInput) =>
      apiClient.post(API_ROUTES.STARTUP_BUDGETS(startupId), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.list(startupId) });
      queryClient.invalidateQueries({
        queryKey: startupKeys.detail(startupId),
      });
    },
  });
}

export function useUpdateBudget(id: string, startupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateBudgetCategoryInput) =>
      apiClient.patch(API_ROUTES.BUDGET(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: budgetKeys.list(startupId) });
      queryClient.invalidateQueries({
        queryKey: startupKeys.detail(startupId),
      });
    },
  });
}

export function useDeleteBudget(startupId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ROUTES.BUDGET(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.list(startupId) });
      queryClient.invalidateQueries({
        queryKey: startupKeys.detail(startupId),
      });
    },
  });
}

export function useBudgetMetrics(startupId: string) {
  return useQuery<ApiSuccessResponse<BudgetTotals>>({
    queryKey: [...budgetKeys.list(startupId), "metrics"],
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<BudgetTotals>>(
        API_ROUTES.STARTUP_BUDGETS_METRICS(startupId)
      ),
    enabled: !!startupId,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}
