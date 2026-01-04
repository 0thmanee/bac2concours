import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateVideoInput,
  UpdateVideoInput,
  VideoFilters,
  VideoStats,
  VideoFilterOptions,
  VideoWithRelations,
} from "@/lib/validations/video.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils/filter.utils";

// Re-export query keys for convenience
export const videoKeys = {
  all: QUERY_KEYS.VIDEOS.ALL,
  lists: QUERY_KEYS.VIDEOS.LISTS,
  list: QUERY_KEYS.VIDEOS.LIST,
  details: QUERY_KEYS.VIDEOS.DETAILS,
  detail: QUERY_KEYS.VIDEOS.DETAIL,
  stats: QUERY_KEYS.VIDEOS.STATS,
  filters: QUERY_KEYS.VIDEOS.FILTERS,
  related: QUERY_KEYS.VIDEOS.RELATED,
};

// Paginated videos response type
export interface VideosResponse {
  videos: VideoWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all videos with optional filtering and pagination
 */
export function useVideos(filters?: Partial<VideoFilters>) {
  return useQuery<ApiSuccessResponse<VideosResponse>>({
    queryKey: videoKeys.list(filters),
    queryFn: () => {
      const params = buildSearchParams(
        {
          search: filters?.search,
          category: filters?.category,
          school: filters?.school,
          level: filters?.level,
          subject: filters?.subject,
          status: filters?.status,
          isPublic: filters?.isPublic,
          tags: filters?.tags,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
        { page: filters?.page || 1, limit: filters?.limit || 10 }
      );
      return apiClient.get<ApiSuccessResponse<VideosResponse>>(
        `${API_ROUTES.VIDEOS}?${params.toString()}`
      );
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get a single video by ID
 */
export function useVideo(videoId: string) {
  return useQuery<ApiSuccessResponse<VideoWithRelations>>({
    queryKey: videoKeys.detail(videoId),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<VideoWithRelations>>(
        API_ROUTES.VIDEO(videoId)
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get related videos
 */
export function useRelatedVideos(videoId: string) {
  return useQuery<ApiSuccessResponse<VideoWithRelations[]>>({
    queryKey: videoKeys.related(videoId),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<VideoWithRelations[]>>(
        API_ROUTES.VIDEO_RELATED(videoId)
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get video statistics (admin only)
 */
export function useVideoStats() {
  return useQuery<ApiSuccessResponse<VideoStats>>({
    queryKey: videoKeys.stats(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<VideoStats>>(API_ROUTES.VIDEOS_STATS),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get video filter options (categories, schools, levels, subjects)
 */
export function useVideoFilterOptions() {
  return useQuery<ApiSuccessResponse<VideoFilterOptions>>({
    queryKey: videoKeys.filters(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<VideoFilterOptions>>(
        API_ROUTES.VIDEOS_FILTERS
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Create a new video (admin only)
 */
export function useCreateVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVideoInput) =>
      apiClient.post<ApiSuccessResponse<VideoWithRelations>>(
        API_ROUTES.VIDEOS,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
      queryClient.invalidateQueries({ queryKey: videoKeys.stats() });
    },
  });
}

/**
 * Update a video (admin only)
 */
export function useUpdateVideo(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateVideoInput) =>
      apiClient.patch<ApiSuccessResponse<VideoWithRelations>>(
        API_ROUTES.VIDEO(videoId),
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) });
      queryClient.invalidateQueries({ queryKey: videoKeys.stats() });
    },
  });
}

/**
 * Delete a video (admin only)
 */
export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) =>
      apiClient.delete<ApiSuccessResponse<{ message: string }>>(
        API_ROUTES.VIDEO(videoId)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
      queryClient.invalidateQueries({ queryKey: videoKeys.stats() });
    },
  });
}

/**
 * Increment video view count
 */
export function useIncrementVideoViews(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<ApiSuccessResponse<{ views: number }>>(
        API_ROUTES.VIDEO_VIEW(videoId),
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.detail(videoId) });
    },
  });
}
