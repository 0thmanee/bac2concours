import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateStartupInput,
  UpdateStartupInput,
  StartupQueryOptions,
  StartupWithSpentBudget,
  StartupMetrics,
} from "@/lib/validations/startup.validation";
import type {
  StartupWithRelations,
  StartupWithFullRelations,
  ApiSuccessResponse,
} from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";

// Re-export query keys for convenience (maintain backward compatibility)
export const startupKeys = {
  all: QUERY_KEYS.STARTUPS.ALL,
  lists: QUERY_KEYS.STARTUPS.LISTS,
  list: QUERY_KEYS.STARTUPS.LIST,
  details: QUERY_KEYS.STARTUPS.DETAILS,
  detail: QUERY_KEYS.STARTUPS.DETAIL,
  budgets: QUERY_KEYS.STARTUPS.BUDGETS,
  metrics: QUERY_KEYS.STARTUPS.METRICS,
};

// Hooks
export function useStartups(filters?: StartupQueryOptions) {
  return useQuery<
    ApiSuccessResponse<StartupWithSpentBudget<StartupWithRelations>[]>
  >({
    queryKey: startupKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.includeSpentBudgets)
        params.append("includeSpentBudgets", "true");
      const queryString = params.toString();
      return apiClient.get<
        ApiSuccessResponse<StartupWithSpentBudget<StartupWithRelations>[]>
      >(`${API_ROUTES.STARTUPS}${queryString ? `?${queryString}` : ""}`);
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useStartup(id: string) {
  return useQuery<ApiSuccessResponse<StartupWithFullRelations>>({
    queryKey: startupKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<StartupWithFullRelations>>(
        API_ROUTES.STARTUP(id)
      ),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useCreateStartup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateStartupInput) =>
      apiClient.post(API_ROUTES.STARTUPS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: startupKeys.lists() });
    },
  });
}

export function useUpdateStartup(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateStartupInput) =>
      apiClient.patch(API_ROUTES.STARTUP(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: startupKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: startupKeys.lists() });
    },
  });
}

export function useDeleteStartup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ROUTES.STARTUP(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: startupKeys.lists() });
    },
  });
}

// Hook for founders to get their own startups
export function useMyStartups() {
  return useQuery<ApiSuccessResponse<StartupWithRelations[]>>({
    queryKey: [...startupKeys.all, "me"],
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<StartupWithRelations[]>>(
        API_ROUTES.STARTUPS_ME
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useStartupMetrics() {
  return useQuery<ApiSuccessResponse<StartupMetrics>>({
    queryKey: startupKeys.metrics(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<StartupMetrics>>(
        API_ROUTES.STARTUPS_METRICS
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.CACHE_TIME.SHORT,
  });
}
