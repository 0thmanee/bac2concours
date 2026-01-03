import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { API_ROUTES, QUERY_KEYS, QUERY_CONFIG } from "@/lib/constants";
import type {
  UpdateProfileInput,
  UserWithCount,
} from "@/lib/validations/user.validation";

// Query Keys
export const profileKeys = {
  all: ["profile"] as const,
  current: () => [...profileKeys.all, "current"] as const,
};

// Get current user's profile
export function useProfile() {
  return useQuery<ApiSuccessResponse<UserWithCount>>({
    queryKey: profileKeys.current(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<UserWithCount>>(API_ROUTES.PROFILE),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

// Update current user's profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiClient.patch<ApiSuccessResponse<UserWithCount>>(
        API_ROUTES.PROFILE,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.current() });
      // Also invalidate users list if user is admin viewing users page
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS.ALL });
    },
  });
}
