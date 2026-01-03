import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  BudgetReportQueryParams,
  ActivityReportQueryParams,
} from "@/lib/validations/report.validation";
import type { ExpenseReportQueryParams } from "@/lib/validations/expense.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import type {
  BudgetReport,
  ExpenseReport,
  ActivityReport,
} from "@/lib/types/report.types";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";

// Re-export query keys for convenience (maintain backward compatibility)
export const reportKeys = {
  all: QUERY_KEYS.REPORTS.ALL,
  budget: QUERY_KEYS.REPORTS.BUDGET,
  expenses: QUERY_KEYS.REPORTS.EXPENSES,
  activity: QUERY_KEYS.REPORTS.ACTIVITY,
};

// Hooks
export function useBudgetReport(params?: BudgetReportQueryParams) {
  return useQuery<ApiSuccessResponse<BudgetReport>>({
    queryKey: reportKeys.budget(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startupId) searchParams.append("startupId", params.startupId);

      const url = `${API_ROUTES.REPORTS_BUDGET}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      return apiClient.get<ApiSuccessResponse<BudgetReport>>(url);
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useExpenseReport(params?: ExpenseReportQueryParams) {
  return useQuery<ApiSuccessResponse<ExpenseReport>>({
    queryKey: reportKeys.expenses(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startupId) searchParams.append("startupId", params.startupId);
      if (params?.status) searchParams.append("status", params.status);
      if (params?.startDate) searchParams.append("startDate", params.startDate);
      if (params?.endDate) searchParams.append("endDate", params.endDate);

      const url = `${API_ROUTES.REPORTS_EXPENSES}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      return apiClient.get<ApiSuccessResponse<ExpenseReport>>(url);
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useActivityReport(params?: ActivityReportQueryParams) {
  return useQuery<ApiSuccessResponse<ActivityReport>>({
    queryKey: reportKeys.activity(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startupId) searchParams.append("startupId", params.startupId);
      if (params?.startDate) searchParams.append("startDate", params.startDate);
      if (params?.endDate) searchParams.append("endDate", params.endDate);

      const url = `${API_ROUTES.REPORTS_ACTIVITY}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      return apiClient.get<ApiSuccessResponse<ActivityReport>>(url);
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}
