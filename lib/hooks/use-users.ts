import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserQueryParams,
} from "@/lib/validations/user.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";

// Re-export query keys for convenience
export const userKeys = {
  all: QUERY_KEYS.USERS.ALL,
  lists: QUERY_KEYS.USERS.LISTS,
  list: QUERY_KEYS.USERS.LIST,
  details: QUERY_KEYS.USERS.DETAILS,
  detail: QUERY_KEYS.USERS.DETAIL,
  metrics: QUERY_KEYS.USERS.METRICS,
};

// Hooks
export function useUsers(filters?: UserQueryParams) {
  return useQuery<ApiSuccessResponse<unknown[]>>({
    queryKey: userKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.role) params.append("role", filters.role);
      if (filters?.status) params.append("status", filters.status);
      if (filters?.search) params.append("search", filters.search);
      const queryString = params.toString();
      return apiClient.get<ApiSuccessResponse<unknown[]>>(
        `${API_ROUTES.USERS}${queryString ? `?${queryString}` : ""}`
      );
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useUser(id: string) {
  return useQuery<ApiSuccessResponse<unknown>>({
    queryKey: userKeys.detail(id),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<unknown>>(API_ROUTES.USER(id)),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserInput) =>
      apiClient.post(API_ROUTES.USERS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) =>
      apiClient.patch(API_ROUTES.USER(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(API_ROUTES.USER(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.metrics() });
    },
  });
}

export function useUserMetrics() {
  return useQuery<
    ApiSuccessResponse<{
      totalCount: number;
      adminCount: number;
      studentCount: number;
      activeCount: number;
      verifiedCount: number;
    }>
  >({
    queryKey: userKeys.metrics(),
    queryFn: () =>
      apiClient.get<
        ApiSuccessResponse<{
          totalCount: number;
          adminCount: number;
          studentCount: number;
          activeCount: number;
          verifiedCount: number;
        }>
      >(API_ROUTES.USERS_METRICS),
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.CACHE_TIME.SHORT,
  });
}
