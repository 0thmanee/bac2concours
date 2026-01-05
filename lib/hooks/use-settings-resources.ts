import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateLevelInput,
  UpdateLevelInput,
  CreateMatiereInput,
  UpdateMatiereInput,
} from "@/lib/validations/settings-resources.validation";
import type { ApiSuccessResponse } from "@/lib/types/prisma";
import { QUERY_KEYS, QUERY_CONFIG, API_ROUTES } from "@/lib/constants";
import type { Category, Level, Matiere } from "@prisma/client";

// ============================================================
// TYPES
// ============================================================

interface CategoriesResponse {
  categories: Category[];
  total: number;
}

interface LevelsResponse {
  levels: Level[];
  total: number;
}

interface MatieresResponse {
  matieres: Matiere[];
  total: number;
}

interface DropdownOptions {
  categories: Array<{ value: string; label: string }>;
  levels: Array<{ value: string; label: string }>;
  matieres: Array<{ value: string; label: string }>;
}

// ============================================================
// CATEGORY HOOKS
// ============================================================

export const categoryKeys = {
  all: QUERY_KEYS.CATEGORIES.ALL,
  lists: QUERY_KEYS.CATEGORIES.LISTS,
  list: QUERY_KEYS.CATEGORIES.LIST,
  details: QUERY_KEYS.CATEGORIES.DETAILS,
  detail: QUERY_KEYS.CATEGORIES.DETAIL,
  active: QUERY_KEYS.CATEGORIES.ACTIVE,
};

/**
 * Get all categories
 */
export function useCategories() {
  return useQuery<ApiSuccessResponse<CategoriesResponse>>({
    queryKey: categoryKeys.lists(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<CategoriesResponse>>(
        API_ROUTES.CATEGORIES
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Get active categories for dropdowns
 */
export function useActiveCategories() {
  return useQuery<ApiSuccessResponse<Category[]>>({
    queryKey: categoryKeys.active(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<Category[]>>(
        API_ROUTES.CATEGORIES_ACTIVE
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Create a category
 */
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) =>
      apiClient.post<ApiSuccessResponse<Category>>(API_ROUTES.CATEGORIES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

/**
 * Update a category
 */
export function useUpdateCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCategoryInput) =>
      apiClient.patch<ApiSuccessResponse<Category>>(
        API_ROUTES.CATEGORY(id),
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

/**
 * Delete a category
 */
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<ApiSuccessResponse<void>>(API_ROUTES.CATEGORY(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

// ============================================================
// LEVEL HOOKS
// ============================================================

export const levelKeys = {
  all: QUERY_KEYS.LEVELS.ALL,
  lists: QUERY_KEYS.LEVELS.LISTS,
  list: QUERY_KEYS.LEVELS.LIST,
  details: QUERY_KEYS.LEVELS.DETAILS,
  detail: QUERY_KEYS.LEVELS.DETAIL,
  active: QUERY_KEYS.LEVELS.ACTIVE,
};

/**
 * Get all levels
 */
export function useLevels() {
  return useQuery<ApiSuccessResponse<LevelsResponse>>({
    queryKey: levelKeys.lists(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<LevelsResponse>>(API_ROUTES.LEVELS),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Get active levels for dropdowns
 */
export function useActiveLevels() {
  return useQuery<ApiSuccessResponse<Level[]>>({
    queryKey: levelKeys.active(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<Level[]>>(API_ROUTES.LEVELS_ACTIVE),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Create a level
 */
export function useCreateLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLevelInput) =>
      apiClient.post<ApiSuccessResponse<Level>>(API_ROUTES.LEVELS, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: levelKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

/**
 * Update a level
 */
export function useUpdateLevel(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateLevelInput) =>
      apiClient.patch<ApiSuccessResponse<Level>>(API_ROUTES.LEVEL(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: levelKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

/**
 * Delete a level
 */
export function useDeleteLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<ApiSuccessResponse<void>>(API_ROUTES.LEVEL(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: levelKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

// ============================================================
// MATIERE HOOKS
// ============================================================

export const matiereKeys = {
  all: QUERY_KEYS.MATIERES.ALL,
  lists: QUERY_KEYS.MATIERES.LISTS,
  list: QUERY_KEYS.MATIERES.LIST,
  details: QUERY_KEYS.MATIERES.DETAILS,
  detail: QUERY_KEYS.MATIERES.DETAIL,
  active: QUERY_KEYS.MATIERES.ACTIVE,
};

/**
 * Get all matieres
 */
export function useMatieres() {
  return useQuery<ApiSuccessResponse<MatieresResponse>>({
    queryKey: matiereKeys.lists(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<MatieresResponse>>(API_ROUTES.MATIERES),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Get active matieres for dropdowns
 */
export function useActiveMatieres() {
  return useQuery<ApiSuccessResponse<Matiere[]>>({
    queryKey: matiereKeys.active(),
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<Matiere[]>>(API_ROUTES.MATIERES_ACTIVE),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}

/**
 * Create a matiere
 */
export function useCreateMatiere() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMatiereInput) =>
      apiClient.post<ApiSuccessResponse<Matiere>>(API_ROUTES.MATIERES, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matiereKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

/**
 * Update a matiere
 */
export function useUpdateMatiere(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMatiereInput) =>
      apiClient.patch<ApiSuccessResponse<Matiere>>(
        API_ROUTES.MATIERE(id),
        data
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matiereKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

/**
 * Delete a matiere
 */
export function useDeleteMatiere() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<ApiSuccessResponse<void>>(API_ROUTES.MATIERE(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matiereKeys.all });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
      });
    },
  });
}

// ============================================================
// COMBINED DROPDOWN OPTIONS HOOK
// ============================================================

/**
 * Get all dropdown options (categories, levels, matieres) for forms
 */
export function useDropdownOptions() {
  return useQuery<ApiSuccessResponse<DropdownOptions>>({
    queryKey: QUERY_KEYS.DROPDOWN_OPTIONS.ALL,
    queryFn: () =>
      apiClient.get<ApiSuccessResponse<DropdownOptions>>(
        API_ROUTES.DROPDOWN_OPTIONS
      ),
    staleTime: QUERY_CONFIG.STALE_TIME.LONG,
    gcTime: QUERY_CONFIG.CACHE_TIME.LONG,
  });
}
