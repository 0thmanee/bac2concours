import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { UpdateSettingsInput } from "@/lib/validations/settings.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import type { IncubatorSettings } from "@prisma/client";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";

// Re-export query keys for convenience (maintain backward compatibility)
export const settingsKeys = {
  all: QUERY_KEYS.SETTINGS.ALL,
  detail: QUERY_KEYS.SETTINGS.DETAIL,
};

// Hooks
export function useSettings() {
  return useQuery<ApiSuccessResponse<IncubatorSettings>>({
    queryKey: settingsKeys.detail(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<IncubatorSettings>>(API_ROUTES.SETTINGS),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingsInput) =>
      apiClient.patch(API_ROUTES.SETTINGS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.detail() });
    },
  });
}
