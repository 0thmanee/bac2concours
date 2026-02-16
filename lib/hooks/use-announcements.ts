import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
  AnnouncementFilters,
} from "@/lib/validations/announcement.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils/filter.utils";

export type AnnouncementWithRelations = Awaited<
  ReturnType<
    typeof import("@/lib/services/announcement.service").announcementService.findById
  >
>;

export const announcementKeys = {
  all: QUERY_KEYS.ANNOUNCEMENTS.ALL,
  lists: QUERY_KEYS.ANNOUNCEMENTS.LISTS,
  list: QUERY_KEYS.ANNOUNCEMENTS.LIST,
  details: QUERY_KEYS.ANNOUNCEMENTS.DETAILS,
  detail: QUERY_KEYS.ANNOUNCEMENTS.DETAIL,
};

export interface AnnouncementsResponse {
  announcements: AnnouncementWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useAnnouncements(filters?: Partial<AnnouncementFilters>) {
  return useQuery<ApiSuccessResponse<AnnouncementsResponse>>({
    queryKey: announcementKeys.list(filters),
    queryFn: () => {
      const params = buildSearchParams(
        {
          search: filters?.search,
          type: filters?.type,
          status: filters?.status,
          schoolId: filters?.schoolId,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
        { page: filters?.page || 1, limit: filters?.limit || 10 },
      );
      return apiClient.get<ApiSuccessResponse<AnnouncementsResponse>>(
        `${API_ROUTES.ANNOUNCEMENTS}?${params.toString()}`,
      );
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useAnnouncement(id: string | null) {
  return useQuery<ApiSuccessResponse<AnnouncementWithRelations>>({
    queryKey: announcementKeys.detail(id!),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<AnnouncementWithRelations>>(
        API_ROUTES.ANNOUNCEMENT(id!),
      ),
    enabled: !!id,
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) =>
      apiClient.post<ApiSuccessResponse<AnnouncementWithRelations>>(
        API_ROUTES.ANNOUNCEMENTS,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}

export function useUpdateAnnouncement(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAnnouncementInput) =>
      apiClient.patch<ApiSuccessResponse<AnnouncementWithRelations>>(
        API_ROUTES.ANNOUNCEMENT(id),
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(id) });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ success: true; message: string }>(
        API_ROUTES.ANNOUNCEMENT(id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
    },
  });
}

export function usePublishAnnouncement(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<ApiSuccessResponse<AnnouncementWithRelations>>(
        API_ROUTES.ANNOUNCEMENT_PUBLISH(id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: announcementKeys.all });
      queryClient.invalidateQueries({ queryKey: announcementKeys.detail(id) });
    },
  });
}
