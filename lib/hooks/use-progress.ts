import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { startupKeys } from "./use-startups";
import { API_ROUTES } from "@/lib/constants";
import type {
  CreateProgressUpdateInput,
  ProgressQueryParams,
} from "@/lib/validations/progress.validation";
import type {
  ApiSuccessResponse,
  ProgressUpdateWithRelations,
} from "@/lib/types/prisma";

// Query Keys
export const progressKeys = {
  all: ["progress"] as const,
  lists: () => [...progressKeys.all, "list"] as const,
  list: (filters?: ProgressQueryParams) =>
    [...progressKeys.lists(), filters] as const,
  details: () => [...progressKeys.all, "detail"] as const,
  detail: (id: string) => [...progressKeys.details(), id] as const,
  byStartup: (startupId: string) =>
    [...progressKeys.lists(), { startupId }] as const,
};

// Hooks
export function useProgressUpdates(params?: ProgressQueryParams) {
  return useQuery<ApiSuccessResponse<ProgressUpdateWithRelations[]>>({
    queryKey: progressKeys.list(params),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      if (params?.startupId) searchParams.append("startupId", params.startupId);
      if (params?.me) searchParams.append("me", params.me);

      const url = `${API_ROUTES.PROGRESS}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      return apiClient.get<ApiSuccessResponse<ProgressUpdateWithRelations[]>>(
        url
      );
    },
    enabled: !!params,
  });
}

export function useProgressUpdate(id: string) {
  return useQuery({
    queryKey: progressKeys.detail(id),
    queryFn: () => apiClient.get(`${API_ROUTES.PROGRESS}/${id}`),
    enabled: !!id,
  });
}

export function useCreateProgressUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProgressUpdateInput) =>
      apiClient.post(API_ROUTES.PROGRESS, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: progressKeys.lists() });
      if (variables.startupId) {
        queryClient.invalidateQueries({
          queryKey: progressKeys.byStartup(variables.startupId),
        });
        queryClient.invalidateQueries({
          queryKey: startupKeys.detail(variables.startupId),
        });
      }
    },
  });
}
