import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryQueryParams,
} from "@/lib/validations/category.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";

// Re-export query keys for convenience
export const categoryKeys = {
  all: QUERY_KEYS.CATEGORIES.ALL,
  lists: QUERY_KEYS.CATEGORIES.LISTS,
  list: QUERY_KEYS.CATEGORIES.LIST,
  details: QUERY_KEYS.CATEGORIES.DETAILS,
  detail: QUERY_KEYS.CATEGORIES.DETAIL,
  active: QUERY_KEYS.CATEGORIES.ACTIVE,
  metrics: QUERY_KEYS.CATEGORIES.METRICS,
};

// Hooks
export function useCategories(filters?: CategoryQueryParams) {
  return useQuery<ApiSuccessResponse<unknown[]>>({
    queryKey: categoryKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.isActive !== undefined) params.append("isActive", String(filters.isActive));
      if (filters?.search) params.append("search", filters.search);
      const queryString = params.toString();
      return apiClient.get<ApiSuccessResponse<unknown[]>>(
        `${API_ROUTES.CATEGORIES}${queryString ? `?${queryString}` : ""}`
      );
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

// Hook to get only active categories (for dropdowns)
export function useActiveCategories() {
  return useQuery<ApiSuccessResponse<unknown[]>>({
    queryKey: categoryKeys.active(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<unknown[]>>(`${API_ROUTES.CATEGORIES}?isActive=true`),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useCategory(id: string) {
  return useQuery<ApiSuccessResponse<unknown>>({
    queryKey: categoryKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<unknown>>(API_ROUTES.CATEGORY(id)),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      apiClient.post(API_ROUTES.CATEGORIES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.active() });
    },
  });
}

export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryInput) =>
      apiClient.patch(API_ROUTES.CATEGORY(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.active() });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ROUTES.CATEGORY(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.active() });
      queryClient.invalidateQueries({ queryKey: categoryKeys.metrics() });
    },
  });
}

export function useCategoryMetrics() {
  return useQuery<ApiSuccessResponse<{
    totalCount: number;
    activeCount: number;
    inactiveCount: number;
    totalExpensesCount: number;
  }>>({
    queryKey: categoryKeys.metrics(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<{
        totalCount: number;
        activeCount: number;
        inactiveCount: number;
        totalExpensesCount: number;
      }>>(API_ROUTES.CATEGORIES_METRICS),
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.CACHE_TIME.SHORT,
  });
}

