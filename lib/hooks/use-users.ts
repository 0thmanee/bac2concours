import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateUserInput,
  UpdateUserInput,
  UserQueryParams,
  UserWithCount,
  UserMetrics,
} from "@/lib/validations/user.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils/filter.utils";

// Re-export query keys for convenience
export const userKeys = {
  all: QUERY_KEYS.USERS.ALL,
  lists: QUERY_KEYS.USERS.LISTS,
  list: QUERY_KEYS.USERS.LIST,
  details: QUERY_KEYS.USERS.DETAILS,
  detail: QUERY_KEYS.USERS.DETAIL,
  metrics: QUERY_KEYS.USERS.METRICS,
};

// Paginated users response type
export interface UsersResponse {
  users: UserWithCount[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Hooks
export function useUsers(filters?: Partial<UserQueryParams>) {
  return useQuery<ApiSuccessResponse<UsersResponse>>({
    queryKey: userKeys.list(filters),
    queryFn: () => {
      const params = buildSearchParams(
        {
          role: filters?.role,
          status: filters?.status,
          search: filters?.search,
        },
        { page: filters?.page || 1, limit: filters?.limit || 10 }
      );
      return apiClient.get<ApiSuccessResponse<UsersResponse>>(
        `${API_ROUTES.USERS}?${params.toString()}`
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
  return useQuery<ApiSuccessResponse<UserMetrics>>({
    queryKey: userKeys.metrics(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<UserMetrics>>(API_ROUTES.USERS_METRICS),
    staleTime: QUERY_CONFIG.STALE_TIME.SHORT,
    gcTime: QUERY_CONFIG.CACHE_TIME.SHORT,
  });
}
