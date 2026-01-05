import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateSchoolInput,
  UpdateSchoolInput,
  SchoolFilters,
  SchoolStats,
  SchoolFilterOptions,
  SchoolWithRelations,
} from "@/lib/validations/school.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils/filter.utils";

// Re-export query keys for convenience
export const schoolKeys = {
  all: QUERY_KEYS.SCHOOLS.ALL,
  lists: QUERY_KEYS.SCHOOLS.LISTS,
  list: QUERY_KEYS.SCHOOLS.LIST,
  details: QUERY_KEYS.SCHOOLS.DETAILS,
  detail: QUERY_KEYS.SCHOOLS.DETAIL,
  stats: QUERY_KEYS.SCHOOLS.STATS,
  filters: QUERY_KEYS.SCHOOLS.FILTERS,
};

// Paginated schools response type
export interface SchoolsResponse {
  schools: SchoolWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get all schools with optional filtering and pagination
 */
export function useSchools(filters?: Partial<SchoolFilters>) {
  return useQuery<ApiSuccessResponse<SchoolsResponse>>({
    queryKey: schoolKeys.list(filters),
    queryFn: () => {
      const params = buildSearchParams(
        {
          search: filters?.search,
          type: filters?.type,
          city: filters?.city,
          region: filters?.region,
          status: filters?.status,
          isPublic: filters?.isPublic,
          featured: filters?.featured,
          bourses: filters?.bourses,
          sortBy: filters?.sortBy,
          sortOrder: filters?.sortOrder,
        },
        { page: filters?.page || 1, limit: filters?.limit || 10 }
      );
      return apiClient.get<ApiSuccessResponse<SchoolsResponse>>(
        `${API_ROUTES.SCHOOLS}?${params.toString()}`
      );
    },
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get a single school by ID
 */
export function useSchool(schoolId: string) {
  return useQuery<ApiSuccessResponse<SchoolWithRelations>>({
    queryKey: schoolKeys.detail(schoolId),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<SchoolWithRelations>>(
        API_ROUTES.SCHOOL(schoolId)
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get school statistics (admin only)
 */
export function useSchoolStats() {
  return useQuery<ApiSuccessResponse<SchoolStats>>({
    queryKey: schoolKeys.stats(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<SchoolStats>>(API_ROUTES.SCHOOLS_STATS),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
  });
}

/**
 * Get school filter options (types, cities, regions)
 */
export function useSchoolFilterOptions() {
  return useQuery<ApiSuccessResponse<SchoolFilterOptions>>({
    queryKey: schoolKeys.filters(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<SchoolFilterOptions>>(
        API_ROUTES.SCHOOLS_FILTERS
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Create a new school (admin only)
 */
export function useCreateSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSchoolInput) =>
      apiClient.post<ApiSuccessResponse<SchoolWithRelations>>(
        API_ROUTES.SCHOOLS,
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() });
    },
  });
}

/**
 * Update a school (admin only)
 */
export function useUpdateSchool(schoolId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSchoolInput) =>
      apiClient.patch<ApiSuccessResponse<SchoolWithRelations>>(
        API_ROUTES.SCHOOL(schoolId),
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      queryClient.invalidateQueries({ queryKey: schoolKeys.detail(schoolId) });
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() });
    },
  });
}

/**
 * Delete a school (admin only)
 */
export function useDeleteSchool() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolId: string) =>
      apiClient.delete<ApiSuccessResponse<{ message: string }>>(
        API_ROUTES.SCHOOL(schoolId)
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() });
    },
  });
}

/**
 * Increment school view count
 */
export function useIncrementSchoolViews(schoolId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<ApiSuccessResponse<{ views: number }>>(
        API_ROUTES.SCHOOL_VIEW(schoolId),
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.detail(schoolId) });
    },
  });
}

/**
 * Get related schools
 */
export function useRelatedSchools(schoolId: string) {
  return useQuery<ApiSuccessResponse<SchoolWithRelations[]>>({
    queryKey: [...schoolKeys.detail(schoolId), "related"],
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<SchoolWithRelations[]>>(
        API_ROUTES.SCHOOL_RELATED(schoolId)
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.MEDIUM,
    gcTime: QUERY_CONFIG.CACHE_TIME.MEDIUM,
    enabled: !!schoolId,
  });
}

/**
 * Toggle school featured status (admin only)
 */
export function useToggleSchoolFeatured() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (schoolId: string) =>
      apiClient.patch<ApiSuccessResponse<SchoolWithRelations>>(
        `${API_ROUTES.SCHOOL(schoolId)}/featured`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolKeys.all });
      queryClient.invalidateQueries({ queryKey: schoolKeys.stats() });
    },
  });
}
